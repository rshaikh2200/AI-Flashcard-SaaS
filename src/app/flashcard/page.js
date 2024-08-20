"use client";
import { useUser } from "@clerk/nextjs";
import { collection, doc, getDoc, getDocs, writeBatch, setDoc } from "@firebase/firestore";
import {
    Box,
    Button,
    Card,
    CardActionArea,
    CardContent,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Grid,
    Paper,
    TextField,
    Typography,
} from "@mui/material";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { set } from "mongoose";

export default function Flashcard() {
    const { isLoaded, isSignedIn, user } = useUser();
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState([]);

    const searchParams = useSearchParams();
    const search = searchParams.get('id');

    useEffect(() => {
        async function getFlashcards() {
            if (!search || !user) return;
            const colRef = collection(doc(collection(db, "users"), user.id), search);
            const docs = await getDocs(colRef);
            const flashcards = []

            docs.forEach((doc) => {
                flashcards.push({id: doc.id, ...doc.data()});
            });
            setFlashcards(flashcards);
        }
        getFlashcards();
    }, [user, search]);

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    if (!isLoaded || !isSignedIn) return <></>;

    return (
        <Container maxWidth="100vw">
            <Grid container spacing={2}>
                            {flashcards.map((flashcard, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCardClick(index)}>
                                            <CardContent>
                                                <Box
                                                    sx={{
                                                        perspective: "1000px",
                                                        "& > div": {
                                                            transition: "transform 0.6s",
                                                            transformStyle: "preserve-3d",
                                                            position: "relative",
                                                            width: "100%",
                                                            height: "200px",
                                                            boxShadow: "0 4px 8px 0 rgba(0, 0, 0, 0.2)",
                                                            transform: flipped[index]
                                                                ? "rotateY(180deg)"
                                                                : "rotateY(0deg)",
                                                        },
                                                        "& > div > div": {
                                                            transition: "transform 0.6s",
                                                            transformStyle: "preserve-3d",
                                                            position: "absolute",
                                                            width: "100%",
                                                            height: "100%",
                                                            backfaceVisibility: "hidden",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            padding: 2,
                                                            boxSizing: "border-box",
                                                        },
                                                    }}
                                                >
                                                    <div>
                                                        {/* Front Side */}
                                                        <div style={{ transform: "rotateY(0deg)" }}>
                                                            <Typography variant="h5" component="div">
                                                                {flashcard.front}
                                                            </Typography>
                                                        </div>

                                                        {/* Back Side */}
                                                        <div style={{ transform: "rotateY(180deg)" }}>
                                                            <Typography variant="h5" component="div">
                                                                {flashcard.back}
                                                            </Typography>
                                                        </div>
                                                    </div>
                                                </Box>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
            </Grid>
        </Container>
    );

}
