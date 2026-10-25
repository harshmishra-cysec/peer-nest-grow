package com.skillnest.service.grouping;

import com.skillnest.dto.SubGroupMemberResponse;
import com.skillnest.dto.SubGroupResponse;
import com.skillnest.entity.Circle;
import com.skillnest.entity.CircleMember;
import com.skillnest.entity.CircleStatus;
import com.skillnest.entity.SubGroup;
import com.skillnest.entity.SubGroupMember;
import com.skillnest.exception.ResourceNotFoundException;
import com.skillnest.repository.CircleMemberRepository;
import com.skillnest.repository.CircleRepository;
import com.skillnest.repository.SubGroupMemberRepository;
import com.skillnest.repository.SubGroupRepository;
import com.skillnest.repository.UserRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class GroupingService {
    private final CircleMemberRepository circleMembers;
    private final CircleRepository circles;
    private final SubGroupRepository groups;
    private final SubGroupMemberRepository groupMembers;
    private final UserRepository users;
    private final GroupingAlgorithm algorithm = new GroupingAlgorithm();

    public GroupingService(CircleMemberRepository circleMembers, CircleRepository circles, SubGroupRepository groups,
                           SubGroupMemberRepository groupMembers, UserRepository users) {
        this.circleMembers = circleMembers; this.circles = circles; this.groups = groups; this.groupMembers = groupMembers; this.users = users;
    }

    /** Must join the locked-circle transaction so membership, status, and all groups commit or roll back together. */
    @Transactional(propagation = Propagation.MANDATORY)
    public void formCircle(Circle circle) {
        List<CircleMember> members = circleMembers.findByCircleId(circle.getId());
        GroupingResult result = algorithm.group(members.stream().map(m -> new MemberAssessment(
                m.getUser().getId(), m.getAssessmentScore(), m.getAssessmentScore() / 15.0 * 100,
                m.getSkillLevel(), m.getJoinedAt())).toList());
        for (FormedGroup formed : result.groups()) {
            SubGroup subgroup = new SubGroup();
            subgroup.setCircle(circle); subgroup.setName(formed.name()); subgroup.setBalanceLabel(result.balanceLabel());
            subgroup.setLeader(users.findById(formed.leaderUserId()).orElseThrow(() -> new ResourceNotFoundException("Group leader not found")));
            subgroup = groups.save(subgroup);
            for (MemberAssessment assessment : formed.members()) {
                SubGroupMember membership = new SubGroupMember(); membership.setSubGroup(subgroup);
                membership.setUser(users.findById(assessment.userId()).orElseThrow(() -> new ResourceNotFoundException("Group member not found")));
                groupMembers.save(membership);
            }
        }
    }

    @Transactional(readOnly = true)
    public List<SubGroupResponse> getForCircle(Long circleId) {
        if (circles.findById(circleId).filter(c -> c.getStatus() == CircleStatus.GROUPED).isEmpty())
            throw new ResourceNotFoundException("Circle has not been grouped");
        List<SubGroup> found = groups.findByCircleId(circleId);
        if (found.isEmpty()) throw new ResourceNotFoundException("Circle has not been grouped");
        return found.stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public SubGroupResponse getMySubgroup(Long circleId, Long userId) {
        if (circles.findById(circleId).filter(c -> c.getStatus() == CircleStatus.GROUPED).isEmpty())
            throw new ResourceNotFoundException("Circle has not been grouped");
        return groups.findByCircleId(circleId).stream()
                .filter(g -> groupMembers.existsBySubGroupIdAndUserId(g.getId(), userId))
                .findFirst().map(this::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Your sub-group was not found"));
    }

    private SubGroupResponse toResponse(SubGroup group) {
        List<SubGroupMemberResponse> members = groupMembers.findBySubGroupId(group.getId()).stream().map(sm -> {
            CircleMember cm = circleMembers.findByCircleIdAndUserId(group.getCircle().getId(), sm.getUser().getId()).orElseThrow();
            return new SubGroupMemberResponse(sm.getUser().getId(), sm.getUser().getName(), cm.getSkillLevel(), cm.getAssessmentScore(), cm.getJoinedAt());
        }).toList();
        return new SubGroupResponse(group.getId(), group.getCircle().getId(), group.getName(), group.getBalanceLabel(),
                group.getLeader().getId(), group.getCreatedAt(), members);
    }
}
