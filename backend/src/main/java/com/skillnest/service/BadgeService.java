package com.skillnest.service;

import com.skillnest.dto.EarnedBadgeResponse;
import com.skillnest.entity.Badge;
import com.skillnest.entity.Circle;
import com.skillnest.entity.SubGroup;
import com.skillnest.entity.SubGroupMember;
import com.skillnest.entity.Task;
import com.skillnest.entity.TaskStatus;
import com.skillnest.entity.User;
import com.skillnest.entity.UserBadge;
import com.skillnest.repository.BadgeRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.TaskRepository;
import com.skillnest.repository.UserBadgeRepository;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BadgeService {
    private final BadgeRepository badges;
    private final UserBadgeRepository userBadges;
    private final TaskRepository tasks;
    private final SubGroupRepository subGroups;
    private final SubGroupMemberRepository members;

    public BadgeService(BadgeRepository badges, UserBadgeRepository userBadges, TaskRepository tasks,
                        SubGroupRepository subGroups, SubGroupMemberRepository members) {
        this.badges = badges; this.userBadges = userBadges; this.tasks = tasks;
        this.subGroups = subGroups; this.members = members;
    }

    @Transactional
    public void onTaskVerified(Task task) {
        award(task.getAssignee(), "FIRST_TASK_VERIFIED", "Verified a first task.");
        SubGroup group = task.getSubGroup();
        Circle circle = group.getCircle();
        if (LocalDate.now().isBefore(circle.getDeadline())
                && tasks.countBySubGroupIdAndStatus(group.getId(), TaskStatus.VERIFIED)
                == tasks.countBySubGroupId(group.getId())
                && tasks.countBySubGroupId(group.getId()) > 0) {
            for (SubGroupMember member : members.findBySubGroupId(group.getId())) {
                award(member.getUser(), "CIRCLE_COMPLETED", "Completed every task in a sub-group before the circle deadline.");
            }
        }
    }

    @Transactional(readOnly = true)
    public List<EarnedBadgeResponse> getEarnedBadges(Long userId) {
        return userBadges.findByUserId(userId).stream()
                .map(earned -> new EarnedBadgeResponse(earned.getBadge().getId(), earned.getBadge().getName(),
                        earned.getBadge().getDescription(), earned.getEarnedAt()))
                .toList();
    }

    private void award(User user, String name, String description) {
        Badge badge = badges.findByName(name).orElseGet(() -> {
            Badge created = new Badge(); created.setName(name); created.setDescription(description);
            return badges.save(created);
        });
        if (!userBadges.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
            UserBadge earned = new UserBadge(); earned.setUser(user); earned.setBadge(badge);
            userBadges.save(earned);
        }
    }
}
