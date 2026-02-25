"use client";

import { useTransition } from "react";
import { deleteSchedule } from "@/lib/actions";

interface DeleteScheduleButtonProps {
    id: string;
    title: string;
}

export default function DeleteScheduleButton({ id, title }: DeleteScheduleButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        if (!confirm(`"${title}"을 삭제하시겠습니까?`)) return;
        startTransition(async () => {
            await deleteSchedule(id);
        });
    };

    return (
        <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="btn-danger py-2 px-3"
        >
            {isPending ? "삭제 중..." : "삭제"}
        </button>
    );
}
