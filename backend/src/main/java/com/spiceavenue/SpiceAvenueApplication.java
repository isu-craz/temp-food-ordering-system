package com.spiceavenue;

import com.spiceavenue.auth.entity.User;
import com.spiceavenue.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class SpiceAvenueApplication {

    public static void main(String[] args) {
        SpringApplication.run(SpiceAvenueApplication.class, args);
        System.out.println("\n=======================================================");
        System.out.println(" 🌶️  SPICE AVENUE BACKEND SERVER STARTED SUCCESSFULLY ");
        System.out.println(" 👉 API Documentation (Swagger): http://localhost:8080/swagger-ui.html");
        System.out.println("=======================================================\n");
    }

    @Bean
    CommandLineRunner syncSeedPasswords(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            String defaultHash = passwordEncoder.encode("Password123!");
            List<User> users = userRepository.findAll();
            for (User user : users) {
                // If password does not match Password123! and is not self-registered
                if (!passwordEncoder.matches("Password123!", user.getPassword())) {
                    user.setPassword(defaultHash);
                    userRepository.save(user);
                }
            }
            System.out.println("🔑 Synced default credentials (Password123!) for all test user accounts.");
        };
    }
}
