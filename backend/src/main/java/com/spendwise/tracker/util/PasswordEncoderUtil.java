package com.spendwise.tracker.util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;

public class PasswordEncoderUtil {

    private static final String SALT = "SpendWiseSecureSalt2026!";

    public static String encode(String rawPassword) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((rawPassword + SALT).getBytes());
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("Error hashing password", e);
        }
    }

    public static boolean matches(String rawPassword, String encodedPassword) {
        String hashedInput = encode(rawPassword);
        return hashedInput.equals(encodedPassword);
    }
}
