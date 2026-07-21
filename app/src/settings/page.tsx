'use client'

import { useEffect, useState } from "react"
import { NudgeNavBar } from "../components/Nav"

export default function Splitter(){
    const [id, setId] = useState("");
    const [username, setUsername] = useState("");
    const [phone, setPhone] = useState("");
    const [createdAt, setCreatedAt] = useState("");

    useEffect(() => {
        async function fetchUserInfo() {
            try{
                const res = await fetch(`/api/auth/me`);
                if (!res.ok) throw new Error("Failed to fetch");

                const data = await res.json();

                setId(data["id"]);
                setUsername(data["username"]);
                setPhone(data["phone"]);
                setCreatedAt(data["createdAt"]);
            }
            catch (err){
                console.log(err);
            }
        }
        fetchUserInfo();
    }, []);

    return (
        <div>
            <NudgeNavBar />
            <h2>Settings</h2>
            <div>
                <p>id:{id}</p>
                <p>Username:{username}</p>
                <p>Phone:{phone}</p>
                <p>Member Since: {createdAt}</p>
            </div>
        </div>
    )
}