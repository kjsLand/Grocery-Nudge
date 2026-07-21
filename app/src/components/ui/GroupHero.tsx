"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Users } from "lucide-react";
import { colors, fonts, spacing, radii } from "@/app/src/theme/tokens";
import { Members } from "./Members";
import LeaveButton from "./LeaveGroupButton";
import DeleteButton from "./DeleteGroupButton";

interface GroupHeroProps {
  groupName: string;
  description: string;
  group_id: string;
  imageUrl?: string;
  onBack: string;
}

export default function GroupHero({
  groupName = "test",
  description = "Lorem Epsum",
  group_id,
  imageUrl,
  onBack,
}: GroupHeroProps) {
  const router = useRouter();

  function handleBack() {
    router.push(onBack);
  }

  return (
    <section
      style={{
        backgroundColor: colors.paper,
        borderRadius: radii.lg,
        padding: spacing.xl,
        color: colors.amber,
      }}
    >
      <button
        onClick={handleBack}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: spacing.xs,
          background: "none",
          border: "none",
          padding: 0,
          marginBottom: spacing.lg,
          color: colors.slate,
          fontFamily: fonts.body,
          fontSize: "0.85rem",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = colors.paper)}
        onMouseLeave={(e) => (e.currentTarget.style.color = colors.slate)}
      >
        <ArrowLeft size={16} strokeWidth={1.75} />
        Back to groups
      </button>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: spacing.lg,
          borderBottom: `1px solid ${colors.line}`,
          paddingBottom: spacing.lg,
        }}
      >
        <div
          style={{
            position: "relative",
            width: 64,
            height: 64,
            flexShrink: 0,
            borderRadius: radii.md,
            overflow: "hidden",
            backgroundColor: colors.ink,
            border: `1px solid ${colors.line}`,
          }}
        >
          {imageUrl ? (
            <Image src={imageUrl} alt={groupName} fill style={{ objectFit: "cover" }} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: colors.slate,
                fontFamily: fonts.display,
                fontSize: "1.5rem",
              }}
            >
              {groupName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h1
            style={{
              margin: 0,
              fontFamily: fonts.display,
              fontSize: "2.25rem",
              lineHeight: 1.1,
              color: colors.amber,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Group: {groupName}
          </h1>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: spacing.xs,
              marginTop: spacing.xs,
              width: "100%",
              color: colors.amber,
              fontFamily: fonts.body,
              fontSize: "0.8rem",
            }}
          >
            <Members id={group_id} />

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: spacing.xs,
              }}
            >
              <LeaveButton
                group_id={group_id}
                onBack="/src/groups"
              />

              <DeleteButton
                group_id={group_id}
                onBack="/src/groups"
              />
            </div>
          </div>

        <p
            style={{
            marginTop: spacing.md,
            marginBottom: 0,
            color: colors.slate,
            fontFamily: fonts.body,
            fontSize: "0.95rem",
            lineHeight: 1.6,
            }}
        >
            {description}
        </p>
        </div>
      </div>

    </section>
  );
}