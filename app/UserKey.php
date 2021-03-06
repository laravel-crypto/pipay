<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Vinkla\Hashids\Facades\Hashids;
use Response;

class UserKey extends Model
{
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users_key';

	/**
	 * The attributes that are mass assignable.
	 *
	 * @var array
	 */
	protected $fillable = [ 
		'id', 'live_api_key', 'test_api_key' ,
	];

	/**
	 * [keyCreate ]
	 * @param  [type] $user_id [ user's id ]
	 * @return [type]          [ return userKey object ]
	 */
	public static function keyCreate( $user_id ) {

		$param = [
			'id' => $user_id , 
			'live_api_key' => 'sk_live_' . Hashids::connection('main')->encode($user_id) , 
			'test_api_key' => 'sk_test_' . Hashids::connection('alternative')->encode($user_id) , 
		];

		return static::firstOrCreate( $param ); 
	}

	/**
	 * [authenticate ]
	 * @param  [type]  $credentials   [ user's api_key ]
	 * @return [type]             [ return userKey ]
	 */
	public static function authenticate( $credentials ) {
		$api_key = $credentials['api_key'];
		$livemode = $credentials['livemode'];
		
		$model = new static;

		if( preg_match( "/test/" , $api_key ) ) {
			$userKey = $model->where( 'test_api_key' , $api_key )->first();
		} else {
			$userKey = $model->where ( 'live_api_key' , $api_key )->first();
		}

		return $userKey;		
	}

	/**
	 * [getResourceOwnerId]
	 * @param  [type]  $api_key   [ user's api_key ]
	 * @return [type] [ return user id]
	 */
	public static function getResourceOwnerId( $api_key ) {

		$model = new static;

		if( preg_match( "/test/" , $api_key ) ) {
			$userKey = $model->where( 'test_api_key' , $api_key )->first();
		} else {
			$userKey = $model->where ( 'live_api_key' , $api_key )->first();
		}

		$id = $userKey->id;

		return $id;
	}

	public static function getLiveMode( $api_key ) {
		if( preg_match( "/test/" , $api_key ) ) {	
			return 0;
		} else {
			return 1;
		}
	}
}
