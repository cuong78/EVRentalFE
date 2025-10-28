import { useMemo } from "react";

export const getShowDates = () => {
    return Array.from({ length: 7 }).map((_, idx) => {
        const d = new Date();
        d.setDate(d.getDate() + idx);
        return {
            rawDate: d.toLocaleDateString("en-CA"),
            dayOfWeek: d.toLocaleDateString("vi-VN", { weekday: "short" }),
            day: d.getDate(),
            month: `Tháng ${d.getMonth() + 1}`,
        };
    });
};