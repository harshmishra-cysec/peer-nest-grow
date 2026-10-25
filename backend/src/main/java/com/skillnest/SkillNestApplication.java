package com.skillnest;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SkillNestApplication {

    public static void main(String[] args) {
        SpringApplication.run(SkillNestApplication.class, args);
    }
}
