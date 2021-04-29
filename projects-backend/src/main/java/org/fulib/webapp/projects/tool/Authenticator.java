package org.fulib.webapp.projects.tool;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import spark.Request;
import spark.Spark;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Authenticator
{
	private static final String DEFAULT_PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAjSudUTRH8wtEeIQdKh4Yv97HcFGjLzl9+yBm+SO2lf2r/jvpbSRPWqMDbrgQ0BGDwMQLweUoPUzOhZbrScs5edhRxtn3nPKUTiBtOoFiYupTTicdIKY1FAlagSM4/7WBbj0CT14cXQoyZK2VbfYXsu19tdJ/oFPBAGwrsj/ugiGE6c8H6wu4yHPsJFDR8sN524NN4diXOKyZ731IP5lqfN4+bP17/b1KaDG8swsRNW93dfEz0nfcJu+wutI3dLc98/cekOpHUZRzndsshifjuM39RF6oyI89tcuwrrKqrz5HV9CsPBUB2hakGBhg71svZyq304ikQFYej/ydZd0biwIDAQAB";
	private static final String PUBLIC_KEY = System.getenv().getOrDefault("AUTH_PUBLIC_KEY", DEFAULT_PUBLIC_KEY);

	private static final String DEFAULT_ISSUER = "https://se.uniks.de/auth/realms/fulib.org";
	private static final String[] ISSUERS = { System.getenv().getOrDefault("AUTH_ISSUER", DEFAULT_ISSUER) };

	private static final Algorithm ALGORITHM;

	static
	{
		try
		{
			final byte[] encodedPublicKey = Base64.getDecoder().decode(PUBLIC_KEY);
			final X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encodedPublicKey);
			final KeyFactory factory = KeyFactory.getInstance("RSA");
			final RSAPublicKey publicKey = (RSAPublicKey) factory.generatePublic(keySpec);
			ALGORITHM = Algorithm.RSA256(publicKey, null);
		}
		catch (NoSuchAlgorithmException | InvalidKeySpecException e)
		{
			throw new RuntimeException(e);
		}
	}

	private static final JWTVerifier VERIFIER = JWT.require(ALGORITHM).withIssuer(ISSUERS).build();

	public static DecodedJWT getJWT(String authHeader)
	{
		if (authHeader == null)
		{
			throw new IllegalArgumentException("missing auth header");
		}
		final String[] split = authHeader.split(" ");
		if (split.length != 2)
		{
			throw new IllegalArgumentException("invalid auth header");
		}
		if (!"bearer".equalsIgnoreCase(split[0]))
		{
			throw new IllegalArgumentException("unsupported auth method, use 'bearer' instead");
		}
		final String token = split[1];
		try
		{
			return VERIFIER.verify(token);
		}
		catch (JWTVerificationException ex)
		{
			throw new IllegalArgumentException("invalid token", ex);
		}
	}

	public static String getUserId(Request request)
	{
		return getUserId(request.headers("Authorization"));
	}

	public static String getUserId(String authHeader)
	{
		try
		{
			final DecodedJWT jwt = getJWT(authHeader);
			return jwt.getSubject();
		}
		catch (IllegalArgumentException ignored)
		{
			return null;
		}
	}

	public static String getUserIdOr401(Request request)
	{
		final String userId = getUserId(request);
		if (userId == null)
		{
			// language=JSON
			throw Spark.halt(401, "{\n" + "  \"error\": \"missing bearer token\"\n" + "}");
		}
		return userId;
	}

	public static String getAndCheckUserIdQueryParam(Request request)
	{
		final String userIdParam = request.queryParamOrDefault("userId", null);

		final String userId = getUserIdOr401(request);
		if (userIdParam == null)
		{
			// language=JSON
			throw Spark.halt(400, "{\n" + "  \"error\": \"missing userId query parameter\"\n" + "}");
		}
		if (!userId.equals(userIdParam))
		{
			// language=JSON
			throw Spark.halt(400,
			                 "{\n" + "  \"error\": \"userId query parameter does not match ID of logged-in user\"\n"
			                 + "}");
		}
		return userId;
	}
}
