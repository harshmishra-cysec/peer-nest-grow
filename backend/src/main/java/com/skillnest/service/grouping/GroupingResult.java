package com.skillnest.service.grouping;

import java.util.List;

public record GroupingResult(
        String balanceLabel,
        boolean perfectBalance,
        List<FormedGroup> groups
) {
}
