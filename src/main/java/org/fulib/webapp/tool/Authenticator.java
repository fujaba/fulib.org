package org.fulib.webapp.tool;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class Authenticator
{
	private static final String PUBLIC_KEY = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAovqo489IGGIbBeBelkYDgPBRrIv7yarm/U2+ihVFCvq4YGFix9EkpdGXvL6Kerhfmn1OCESpkVZumCFPaXBCiIq5bhNddJBVVZ5Gj9k7wyBNl0rbc7eDnAyE5kVl+HLLpLQmzUrU8lH93astJOF84SmiT1xYQHjxKwH6n7JiensISEwbTvg/pLQGSRF3sL9/Kf0GPsA7RTXh/ZnAk02PAUX9bBm81jePjIG5DGDPh61L1pANYPb/wi9M5LKDnVnIl/J9U4Rx8vHetYJdopt+9aQfDYEeIF7SWysaOqrIQh3vUtk0YaXjXZdnTaxiEa8G4jiSbQGOjemRcn8KA53OmwIDAQAB";
	private static final Algorithm ALGORITHM;
	private static final String[] ISSUERS = { "http://localhost:8080/auth/realms/fulib.org" };

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
}
