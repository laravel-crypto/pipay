<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

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
		'user_id', 'live_api_key', 'test_api_key' ,
	];
    
}
