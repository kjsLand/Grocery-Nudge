'use client'

import { useEffect, useState } from "react"
import { NudgeNavBar } from "../components/Nav"
import { colors, fonts, spacing, radii } from "@/app/src/theme/tokens"

export default function Splitter() {
    const [id, setId] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [createdAt, setCreatedAt] = useState("");
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchUserInfo() {
            setLoading(true);
            setLoadError(null);
            try {
                const res = await fetch(`/api/auth/me`);
                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();

                setId(data["id"]);
                setUsername(data["username"]);
                setPhone(data["phone"]);
                setCreatedAt(data["createdAt"]);
            } catch (err) {
                console.log(err);
                setLoadError("Couldn't load your settings. Try refreshing.");
            } finally {
                setLoading(false);
            }
        }
        fetchUserInfo();
    }, []);

    function formatPhone(raw: string) {
        if (raw.length !== 10) return raw;
        return `${raw.substring(0, 3)}-${raw.substring(3, 6)}-${raw.substring(6, 10)}`;
    }

    function formatDate(raw: string) {
        if (!raw) return "";
        const d = new Date(raw);
        if (isNaN(d.getTime())) return raw;
        return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }

    const fields = [
        { label: "User ID", value: id },
        { label: "Username", value: username },
        { label: "Phone", value: phone ? formatPhone(phone) : "" },
        { label: "Member since", value: formatDate(createdAt) },
    ];

    return (
        <div style={{ minHeight: "100vh", backgroundColor: colors.paper }}>
            <NudgeNavBar />

            <div style={{ maxWidth: "560px", margin: "0 auto", padding: `${spacing.xxl} ${spacing.lg}` }}>
                <p
                    style={{
                        margin: 0,
                        marginBottom: spacing.xs,
                        fontFamily: fonts.body,
                        fontSize: "0.75rem",
                        letterSpacing: "0.12em",
                        textTransform: "uppercase",
                        color: colors.amber,
                    }}
                >
                    Account
                </p>
                <h1
                    style={{
                        margin: 0,
                        marginBottom: spacing.xl,
                        fontFamily: fonts.display,
                        fontSize: "2.25rem",
                        color: colors.mutedPlaceholder,
                    }}
                >
                    Settings
                </h1>

                <div
                    style={{
                        backgroundColor: colors.paper,
                        border: `1px solid ${colors.line}`,
                        borderRadius: radii.lg,
                        overflow: "hidden",
                    }}
                >
                    {loading && (
                        <div style={{ padding: spacing.xl }}>
                            {fields.map((f, i) => (
                                <div
                                    key={f.label}
                                    style={{
                                        height: "1rem",
                                        width: i % 2 === 0 ? "60%" : "40%",
                                        backgroundColor: colors.line,
                                        borderRadius: radii.sm,
                                        marginBottom: i === fields.length - 1 ? 0 : spacing.lg,
                                        opacity: 0.6,
                                    }}
                                />
                            ))}
                        </div>
                    )}

                    {!loading && loadError && (
                        <p
                            style={{
                                margin: 0,
                                padding: spacing.xl,
                                fontFamily: fonts.body,
                                fontSize: "0.875rem",
                                color: colors.error,
                            }}
                        >
                            {loadError}
                        </p>
                    )}

                    {!loading && !loadError && (
                        <dl style={{ margin: 0 }}>
                            {fields.map((f, i) => (
                                <div
                                    key={f.label}
                                    style={{
                                        display: "flex",
                                        alignItems: "baseline",
                                        justifyContent: "space-between",
                                        gap: spacing.md,
                                        padding: `${spacing.md} ${spacing.xl}`,
                                        borderBottom: i === fields.length - 1 ? "none" : `1px solid ${colors.line}`,
                                    }}
                                >
                                    <dt
                                        style={{
                                            margin: 0,
                                            fontFamily: fonts.body,
                                            fontSize: "0.8rem",
                                            color: colors.amber,
                                        }}
                                    >
                                        {f.label}
                                    </dt>
                                    <dd
                                        style={{
                                            margin: 0,
                                            fontFamily: fonts.body,
                                            fontSize: "0.9rem",
                                            color: colors.amber,
                                            textAlign: "right",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {f.value || "—"}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    )}
                </div>
            </div>
        </div>
    );
}