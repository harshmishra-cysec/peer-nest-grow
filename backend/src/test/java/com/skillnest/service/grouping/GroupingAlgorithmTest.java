package com.skillnest.service.grouping;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import com.skillnest.entity.SkillLevel;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class GroupingAlgorithmTest {
    private final GroupingAlgorithm algorithm = new GroupingAlgorithm();

    @Test void uniformDistributionIsPerfectAndDeterministic() {
        verify(levels(3, 3, 3));
    }

    @Test void skewedSevenFiveThreeDistribution() { verify(levels(7, 5, 3)); }
    @Test void allIntermediateDistribution() { verify(levels(0, 9, 0)); }
    @Test void advancedAndSingleIntermediateDistribution() { verify(levels(8, 1, 0)); }

    @Test void supportedCapacityBoundariesProduceExactGroups() {
        for (int size : List.of(12, 18, 30)) verify(levels(size / 3, size / 3, size / 3));
    }

    @Test void rejectsInvalidMemberCounts() {
        assertThrows(IllegalArgumentException.class, () -> algorithm.group(levels(2, 2, 2)));
        assertThrows(IllegalArgumentException.class, () -> algorithm.group(levels(4, 3, 1)));
        assertThrows(IllegalArgumentException.class, () -> algorithm.group(levels(11, 10, 10)));
    }

    private void verify(List<MemberAssessment> input) {
        GroupingResult first = algorithm.group(input);
        GroupingResult second = algorithm.group(input);
        assertEquals(first, second, "same ordered input must always produce the same formation");
        assertEquals(input.size() / 3, first.groups().size());
        assertNotNull(first.balanceLabel());
        Set<Long> expected = input.stream().map(MemberAssessment::userId).collect(Collectors.toSet());
        List<Long> actual = new ArrayList<>();
        for (FormedGroup group : first.groups()) {
            assertEquals(3, group.members().size());
            actual.addAll(group.members().stream().map(MemberAssessment::userId).toList());
            MemberAssessment expectedLeader = group.members().stream()
                    .sorted(java.util.Comparator.comparingInt((MemberAssessment m) -> rank(m.skillLevel())).reversed()
                            .thenComparing(java.util.Comparator.comparingDouble(MemberAssessment::percentage).reversed())
                            .thenComparing(MemberAssessment::joinedAt).thenComparing(MemberAssessment::userId))
                    .findFirst().orElseThrow();
            assertEquals(expectedLeader.userId(), group.leaderUserId());
        }
        assertEquals(input.size(), actual.size(), "no members lost or duplicated");
        assertEquals(expected, Set.copyOf(actual));
        assertEquals(actual.size(), Set.copyOf(actual).size(), "no duplicate members");
        boolean perfect = first.groups().stream().allMatch(group -> group.members().stream()
                .map(MemberAssessment::skillLevel).collect(Collectors.toSet())
                .equals(Set.of(SkillLevel.ADVANCED, SkillLevel.INTERMEDIATE, SkillLevel.BEGINNER)));
        assertEquals(perfect ? "Perfect Balance" : "Best Possible Balance", first.balanceLabel());
    }

    private List<MemberAssessment> levels(int advanced, int intermediate, int beginner) {
        List<MemberAssessment> result = new ArrayList<>(); long id = 1;
        for (int i=0;i<advanced;i++) result.add(member(id++, SkillLevel.ADVANCED, 11 + i % 5));
        for (int i=0;i<intermediate;i++) result.add(member(id++, SkillLevel.INTERMEDIATE, 6 + i % 5));
        for (int i=0;i<beginner;i++) result.add(member(id++, SkillLevel.BEGINNER, i % 6));
        return result;
    }

    private MemberAssessment member(long id, SkillLevel level, int score) {
        return new MemberAssessment(id, score, score / 15.0 * 100, level, Instant.parse("2026-01-01T00:00:00Z").plusSeconds(id));
    }

    private int rank(SkillLevel level) { return switch (level) { case ADVANCED -> 3; case INTERMEDIATE -> 2; case BEGINNER -> 1; }; }
}
