package com.skillnest.service.grouping;

import com.skillnest.constants.AppConstants;
import com.skillnest.entity.SkillLevel;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** Pure, deterministic grouping engine. It has no Spring or persistence dependencies. */
public final class GroupingAlgorithm {

    private static final Comparator<MemberAssessment> MEMBER_ORDER =
            Comparator.comparingInt((MemberAssessment m) -> tier(m.skillLevel())).reversed()
                    .thenComparing(Comparator.comparingDouble(MemberAssessment::percentage).reversed())
                    .thenComparing(MemberAssessment::joinedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                    .thenComparing(MemberAssessment::userId, Comparator.nullsLast(Comparator.naturalOrder()));

    public GroupingResult group(List<MemberAssessment> members) {
        if (members == null) throw new IllegalArgumentException("Members are required");
        int n = members.size();
        if (n < 9 || n > 30 || n % 3 != 0) {
            throw new IllegalArgumentException("Member count must be 9..30 and divisible by 3");
        }
        if (members.stream().anyMatch(m -> m == null || m.userId() == null || m.skillLevel() == null
                || !Double.isFinite(m.percentage()) || m.percentage() < 0 || m.joinedAt() == null)) {
            throw new IllegalArgumentException("Member assessments must have complete, valid values");
        }
        List<MemberAssessment> sorted = members.stream().sorted(MEMBER_ORDER).toList();
        int k = n / 3;
        List<List<MemberAssessment>> greedy = emptyGroups(k);
        for (int i = 0; i < k; i++) greedy.get(i).add(sorted.get(i));
        for (int i = k; i < n; i++) {
            int target = -1;
            for (int g = 0; g < k; g++) {
                if (greedy.get(g).size() < 3 && (target < 0 || score(greedy.get(g)) < score(greedy.get(target)))) target = g;
            }
            greedy.get(target).add(sorted.get(i));
        }
        List<List<MemberAssessment>> snake = emptyGroups(k);
        for (int i = 0; i < n; i++) {
            int position = i % (2 * k);
            int target = position < k ? position : 2 * k - 1 - position;
            snake.get(target).add(sorted.get(i));
        }
        List<List<MemberAssessment>> deal = emptyGroups(k);
        for (int i = 0; i < n; i++) deal.get(i % k).add(sorted.get(i));

        List<List<List<MemberAssessment>>> candidates = List.of(improve(greedy), improve(snake), improve(deal));
        List<List<MemberAssessment>> best = candidates.get(0);
        double bestCost = cost(best);
        for (int i = 1; i < candidates.size(); i++) {
            double candidateCost = cost(candidates.get(i));
            if (candidateCost < bestCost) { best = candidates.get(i); bestCost = candidateCost; }
        }
        validate(members, best);
        boolean perfect = best.stream().allMatch(g -> g.stream().map(MemberAssessment::skillLevel).collect(java.util.stream.Collectors.toSet())
                .equals(Set.of(SkillLevel.ADVANCED, SkillLevel.INTERMEDIATE, SkillLevel.BEGINNER)));
        String label = perfect ? "Perfect Balance" : "Best Possible Balance";
        List<FormedGroup> formed = new ArrayList<>();
        for (int i = 0; i < best.size(); i++) {
            List<MemberAssessment> group = best.get(i).stream().sorted(MEMBER_ORDER).toList();
            formed.add(new FormedGroup("Sub-Group " + GREEK.get(i), group.get(0).userId(), group));
        }
        return new GroupingResult(label, perfect, List.copyOf(formed));
    }

    private static final List<String> GREEK = List.of("Alpha", "Beta", "Gamma", "Delta", "Epsilon", "Zeta", "Eta", "Theta", "Iota", "Kappa");
    private static List<List<MemberAssessment>> emptyGroups(int k) { List<List<MemberAssessment>> groups = new ArrayList<>(); for (int i=0;i<k;i++) groups.add(new ArrayList<>()); return groups; }
    private static int tier(SkillLevel level) { return switch (level) { case ADVANCED -> 3; case INTERMEDIATE -> 2; case BEGINNER -> 1; }; }
    private static double score(List<MemberAssessment> group) { return group.stream().mapToDouble(MemberAssessment::percentage).sum(); }
    private static double cost(List<List<MemberAssessment>> groups) {
        double min = Double.POSITIVE_INFINITY, max = Double.NEGATIVE_INFINITY; int pairs = 0;
        for (List<MemberAssessment> group : groups) { double value = score(group); min = Math.min(min, value); max = Math.max(max, value);
            for (int i=0;i<group.size();i++) for (int j=i+1;j<group.size();j++) if (group.get(i).skillLevel()==group.get(j).skillLevel()) pairs++;
        }
        return max - min + AppConstants.DIVERSITY_WEIGHT * pairs;
    }
    private static List<List<MemberAssessment>> improve(List<List<MemberAssessment>> original) {
        List<List<MemberAssessment>> groups = new ArrayList<>(); for (List<MemberAssessment> g : original) groups.add(new ArrayList<>(g));
        while (true) {
            double current = cost(groups), best = current; int ai=-1,aj=-1,bi=-1,bj=-1;
            for (int a=0;a<groups.size();a++) for (int i=0;i<3;i++) for(int b=a+1;b<groups.size();b++) for(int j=0;j<3;j++) {
                MemberAssessment x=groups.get(a).get(i), y=groups.get(b).get(j);
                groups.get(a).set(i,y); groups.get(b).set(j,x); double next=cost(groups);
                groups.get(a).set(i,x); groups.get(b).set(j,y);
                if (next < best) { best=next; ai=a;aj=i;bi=b;bj=j; }
            }
            if (ai<0) break;
            MemberAssessment x=groups.get(ai).get(aj); groups.get(ai).set(aj,groups.get(bi).get(bj)); groups.get(bi).set(bj,x);
        }
        return groups;
    }
    private static void validate(List<MemberAssessment> input, List<List<MemberAssessment>> groups) {
        Set<Long> expected=new HashSet<>(); input.forEach(m -> expected.add(m.userId())); Set<Long> actual=new HashSet<>();
        if (expected.size()!=input.size() || groups.size()!=input.size()/3) throw new IllegalStateException("Invalid grouping result");
        for (List<MemberAssessment> group:groups) { if(group.size()!=3) throw new IllegalStateException("Invalid subgroup size"); for(MemberAssessment m:group) if(!actual.add(m.userId())) throw new IllegalStateException("Duplicate member in grouping result"); }
        if(!actual.equals(expected)) throw new IllegalStateException("Grouping result lost or added members");
    }
}
