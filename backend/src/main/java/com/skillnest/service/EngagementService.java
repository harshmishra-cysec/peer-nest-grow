package com.skillnest.service;

import com.skillnest.entity.User;
import com.skillnest.repository.UserRepository;
import java.time.LocalDate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EngagementService {
    private final UserRepository users;

    public EngagementService(UserRepository users) { this.users = users; }

    @Transactional
    public void touchActivity(User user) {
        LocalDate today = LocalDate.now();
        LocalDate lastActivity = user.getLastActivityDate();
        if (lastActivity == null || lastActivity.isBefore(today.minusDays(1))) {
            user.setCurrentStreakDays(1);
        } else if (lastActivity.isBefore(today)) {
            user.setCurrentStreakDays(user.getCurrentStreakDays() + 1);
        }
        user.setLastActivityDate(today);
        users.save(user);
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void resetInactiveStreaks() {
        LocalDate yesterday = LocalDate.now().minusDays(1);
        for (User user : users.findByLastActivityDateIsNullOrLastActivityDateBefore(yesterday)) {
            if (user.getCurrentStreakDays() != 0) {
                user.setCurrentStreakDays(0);
                users.save(user);
            }
        }
    }
}
