package com.kedia.service1.controllers;

import org.springframework.web.bind.annotation.*;
import com.kedia.service1.models.User; // Import the User class
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @GetMapping
    public List<User> getAllUsers() {
        return List.of(
            new User(1, "John Doe", "john@example.com"),
            new User(2, "Jane Smith", "jane@example.com")
        );
    }
}
