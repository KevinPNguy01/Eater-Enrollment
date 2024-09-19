/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
import { getDoc, getFirestore, setDoc, doc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import axios from "axios";

const firebaseConfig = {
    apiKey: "AIzaSyD3I7WMH-ZIFwqNcJqcc8q00qEvHZWSHAg",
    authDomain: "eaterenrollment.firebaseapp.com",
    projectId: "eaterenrollment",
    storageBucket: "eaterenrollment.appspot.com",
    messagingSenderId: "667687063300",
    appId: "1:667687063300:web:f35aa0263ecb0b66a08a51",
    measurementId: "G-BJS8NSJXND",
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

export const professors = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") {
        // Send response to OPTIONS requests
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
    } else {
        const searchQuery = req.query.q as string | undefined;

        if (!searchQuery) {
            res.status(400).send("Missing search query.");
            return;
        }

        const url = `https://www.ratemyprofessors.com/search/professors/1074?q=${searchQuery}`;

        try {
            const response = await axios.get(url);
            res.status(200).send(response.data);
        } catch (error) {
            console.error("Error fetching professor data:", error);
            res.status(500).send(error);
        }
    }
});

export const saveUser = onRequest(async (req, res) => {
    const { username, scheduleSetString, currentScheduleIndex } = req.body;

    res.set("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
        // Send response to OPTIONS requests
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
    } else {
        try {
            await setDoc(doc(db, "users", username), {
                schedule_set_string: scheduleSetString,
                selected_index: currentScheduleIndex,
            });
            res.status(200).send(`Saved schedules for "${username}".`);
        } catch (error) {
            console.error("Error saving user data:", error);
            res.status(500).send(`Error saving schedules for "${username}".`);
        }
    }
});

export const loadUser = onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");

    if (req.method === "OPTIONS") {
        // Send response to OPTIONS requests
        res.set("Access-Control-Allow-Methods", "GET");
        res.set("Access-Control-Allow-Headers", "Content-Type");
        res.set("Access-Control-Max-Age", "3600");
        res.status(204).send("");
    } else {
        const key = req.params["0"];
        try {
            const userDocRef = doc(db, "users", key);
            const userDoc = await getDoc(userDocRef);
            if (!userDoc.exists) {
                res.status(404).send(`User "${key}" not found.`);
            } else {
                const data = userDoc.data();
                res.status(200).json({
                    scheduleSetString: data?.schedule_set_string,
                    selectedIndex: data?.selected_index,
                });
            }
        } catch (error) {
            console.error("Error retrieving user schedules:", error);
            res.status(500).send(`Error loading schedules for "${key}".`);
        }
    }
});
