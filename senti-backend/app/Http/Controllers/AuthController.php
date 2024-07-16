<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        // Check if the user already exists before creating a new instance
        if (User::where('email', $request->input('email'))->first()) {
            return response()->json(['message' => 'Email exists, enter another email'], 401);
        }
        $user = $this->save_user_in_db($request->input('firstName'), $request->input('lastName'), $request->input('email'), $request->input('password'));
        return response()->json($user, 201);
    }

    public function save_user_in_db($firstName, $lastName, $email, $password)
    {
        $user = new User;
        $user->firstName = $firstName;
        $user->lastName = $lastName;
        $user->email = $email;
        $user->password = Hash::make($password);
        $user->save();
    }


    public function signin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $user = User::where('email', $request->input('email'))->first();
        if (!$user || !Hash::check($request->input('password'), $user->password)) {
            return response()->json(['message' => 'Email or password is wrong'], 401);
        }
        $token = $user->createToken('auth_token')->plainTextToken;
        return response()->json([
            'message' => 'User logged in successfully',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => $user
        ], 200);
    }

}
