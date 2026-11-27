<?php
/**
 * aboutbuzz – javni seznam video ocen (za new.aboutbuzz.com)
 * ------------------------------------------------------------------
 * Vstavi v: WPCode → Add Snippet → PHP Snippet → Auto Insert → Run Everywhere.
 *
 * Doda NOVO pot (obstoječih ne spreminja):
 *   GET https://aboutbuzz.com/wp-json/aboutbuzz-public/v1/stories?per_page=60&page=1
 *
 * - samo BRANJE, nič ne zapisuje
 * - samo objavljene "stories" z approval = 1 (enako kot stran /video-reviews/)
 * - NE vrača imen, e-mailov ali drugih osebnih podatkov testerjev
 * - v2: polja ACF (watermark_video, product_source, category, jezik, vote_count, rating)
 * - rezultat se hrani v predpomnilniku 10 minut
 */

if ( ! defined( 'ABSPATH' ) ) { exit; }

add_action( 'rest_api_init', function () {
	register_rest_route( 'aboutbuzz-public/v1', '/stories', array(
		'methods'             => 'GET',
		'permission_callback' => '__return_true',
		'callback'            => 'abz_public_stories',
		'args'                => array(
			'per_page' => array( 'default' => 60, 'sanitize_callback' => 'absint' ),
			'page'     => array( 'default' => 1,  'sanitize_callback' => 'absint' ),
		),
	) );
} );

/** Prva neprazna vrednost iz seznama možnih meta ključev. */
function abz_pub_meta( $id, $keys ) {
	foreach ( $keys as $k ) {
		$v = get_post_meta( $id, $k, true );
		if ( $v !== '' && $v !== null && $v !== false && $v !== array() ) { return $v; }
	}
	return '';
}

/** Meta vrednost (URL, ID priponke ali ACF polje) → URL. */
function abz_pub_url( $v ) {
	if ( is_numeric( $v ) ) { return (string) wp_get_attachment_url( (int) $v ); }
	if ( is_array( $v ) )   { return isset( $v['url'] ) ? esc_url_raw( $v['url'] ) : ''; }
	return esc_url_raw( (string) $v );
}

/** Ime prvega izraza iz taksonomije, katere ime vsebuje $needle. */
function abz_pub_term( $id, $needles ) {
	foreach ( get_object_taxonomies( 'stories' ) as $tax ) {
		foreach ( (array) $needles as $needle ) {
			if ( stripos( $tax, $needle ) === false ) { continue; }
			$t = get_the_terms( $id, $tax );
			if ( $t && ! is_wp_error( $t ) ) { return html_entity_decode( $t[0]->name ); }
		}
	}
	return '';
}

/** ACF Select/Checkbox → berljiva oznaka (label), ne interni ključ. */
function abz_pub_acf_label( $id, $name ) {
	if ( ! function_exists( 'get_field_object' ) ) { return ''; }
	$o = get_field_object( $name, $id, false );
	if ( ! $o || ! isset( $o['value'] ) || $o['value'] === '' || $o['value'] === null ) { return ''; }
	$choices = isset( $o['choices'] ) && is_array( $o['choices'] ) ? $o['choices'] : array();
	$vals = is_array( $o['value'] ) ? $o['value'] : array( $o['value'] );
	$labels = array();
	foreach ( $vals as $v ) {
		if ( is_array( $v ) ) { $v = isset( $v['label'] ) ? $v['label'] : reset( $v ); }
		$labels[] = isset( $choices[ $v ] ) ? $choices[ $v ] : $v;
	}
	return implode( ', ', array_filter( array_map( 'strval', $labels ) ) );
}

function abz_pub_text( $s, $max = 600 ) {
	$s = trim( html_entity_decode( wp_strip_all_tags( (string) $s ), ENT_QUOTES, 'UTF-8' ) );
	return mb_strlen( $s ) > $max ? mb_substr( $s, 0, $max - 1 ) . '…' : $s;
}

function abz_public_stories( WP_REST_Request $req ) {
	$per  = min( 100, max( 1, (int) $req['per_page'] ) );
	$page = max( 1, (int) $req['page'] );
	$key  = 'abz_pub_stories_v2_' . $per . '_' . $page;

	$cached = get_transient( $key );
	if ( false !== $cached ) { return rest_ensure_response( $cached ); }

	$q = new WP_Query( array(
		'post_type'           => 'stories',
		'post_status'         => 'publish',
		'meta_query'          => array( array( 'key' => 'approval', 'value' => '1' ) ),
		'posts_per_page'      => $per,
		'paged'               => $page,
		'orderby'             => 'date',
		'order'               => 'DESC',
		'ignore_sticky_posts' => true,
	) );

	$lang_map = array( 'Slovenščina' => 'Slovenian', 'slovenscina' => 'Slovenian', 'slovenian' => 'Slovenian', 'Angleščina' => 'English', 'anglescina' => 'English', 'english' => 'English', 'Ruščina' => 'Russian', 'ruscina' => 'Russian', 'Nemščina' => 'German', 'nemscina' => 'German', 'latvian' => 'Latvian', 'turkish' => 'Turkish' );
	$out = array();

	foreach ( $q->posts as $p ) {
		$id = $p->ID;

		// Video: najprej različica z VODNIM ŽIGOM (ACF watermark_video), šele nato izvirnik (ACF video).
		$video = abz_pub_url( abz_pub_meta( $id, array( 'watermark_video', 'watermarked_video' ) ) );
		$watermarked = (bool) $video;
		if ( ! $video ) { $video = abz_pub_url( abz_pub_meta( $id, array( 'video', 'video_url', 'video_file' ) ) ); }

		$poster = get_the_post_thumbnail_url( $id, 'large' );
		if ( ! $poster ) { $poster = abz_pub_url( abz_pub_meta( $id, array( 'screenshot', 'thumbnail', 'poster' ) ) ); }

		// Značka (EU registrirani): iz ACF product_source.
		$source = abz_pub_acf_label( $id, 'product_source' );
		if ( ! $source ) { $source = (string) abz_pub_meta( $id, array( 'product_source' ) ); }
		$is_tester = (bool) preg_match( '/tester|test|brand|provided|seed|gift|free|zastonj|brezpla|podar/i', $source );
		$badge = $is_tester ? 'Authentic Verified Tester' : 'Authentic Verified Purchase';

		$lang = abz_pub_acf_label( $id, 'jezik' );
		if ( ! $lang ) { $lang = abz_pub_term( $id, array( 'jezik', 'lang' ) ); }
		if ( isset( $lang_map[ $lang ] ) ) { $lang = $lang_map[ $lang ]; }

		$brand = abz_pub_term( $id, array( 'brand' ) );
		if ( ! $brand ) { $brand = (string) abz_pub_meta( $id, array( 'brand' ) ); }
		if ( $brand === '0' ) { $brand = ''; }

		$category = abz_pub_acf_label( $id, 'category' );
		if ( ! $category ) { $category = abz_pub_term( $id, array( 'categor', 'kategorij' ) ); }

		$text = abz_pub_meta( $id, array( 'short_description', 'story' ) );
		$transcript = abz_pub_meta( $id, array( 'transcript' ) );
		if ( ! $transcript && $p->post_content && abz_pub_text( $p->post_content ) !== abz_pub_text( $text ) ) { $transcript = $p->post_content; }
		if ( ! $text ) { $text = $p->post_excerpt; }

		$rating = (float) abz_pub_meta( $id, array( 'rating' ) );

		$out[] = array(
			'id'         => $id,
			'badge'      => $badge,
			'category'   => abz_pub_text( $category, 80 ),
			'lang'       => abz_pub_text( $lang, 40 ),
			'rating'     => ( $rating >= 1 && $rating <= 5 ) ? round( $rating * 2 ) / 2 : 5,
			'useful'     => (int) abz_pub_meta( $id, array( 'vote_count' ) ),
			'transcript' => abz_pub_text( $transcript, 1200 ),
			'source'     => abz_pub_text( $source, 60 ),
			'watermarked'=> $watermarked,
			'brand'      => abz_pub_text( $brand, 120 ),
			'text'       => abz_pub_text( $text ),
			'video'      => $video,
			'poster'     => $poster ? $poster : '',
			'date'       => get_the_date( 'c', $p ),
		);
	}

	$data = array( 'total' => (int) $q->found_posts, 'page' => $page, 'reviews' => $out );
	set_transient( $key, $data, 10 * MINUTE_IN_SECONDS );
	return rest_ensure_response( $data );
}
