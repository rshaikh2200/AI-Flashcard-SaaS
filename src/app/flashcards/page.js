"use client";

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Container, Grid, Card, CardActionArea, CardContent, Typography, Box } from '@mui/material'
import { collection, doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '../../firebase'
import Appbar from "../components/Appbar";

const Page = () => {
  const router = useRouter();
  const { isLoaded, isSignedIn, user } = useUser();
  const [flashcards, setFlashcards] = useState([]);

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        router.push("/sign-in");
      }
    }
  }, [isLoaded, router, user]);

  useEffect(() => {
    async function getFlashcards() {
      if (!user) return;
      const docRef = doc(collection(db, "users"), user.id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const flashcards = docSnap.data().flashcards || [];
        setFlashcards(flashcards);
      } else {
        await setDoc(docRef, { flashcards: [] });
      }
    }
    getFlashcards();
  }, [user]);

  const handleClick = (id) => {
    router.push(`/flashcard?id=${id}`);
  };

  if (!isLoaded && !isSignedIn) return <Loader></Loader>;
  return (
    <Box>
      <Appbar />
      <Container maxWidth="md">
        <Typography variant="h2" sx={{ my: 4 }}>
          My Flashcards
        </Typography>
        {flashcards.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              align: "center",
              backgroundColor: (theme) => theme.palette.tangaroa[200],
            }}
          >
            <Typography variant="p" component="div">
              You don&apos;t have any flashcards yet. <br /> To create one, go
              to the <Link href="/generate">Create Flashcard</Link> page.
            </Typography>
          </Paper>
        ) : (
          <Grid
            container
            columnSpacing={2}
            rowSpacing={1}
            sx={{ mt: 4, minHeight: "12rem" }}
          >
            {flashcards.map((flashcard, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card>
                  <CardActionArea onClick={() => handleClick(flashcard.name)}>
                    <CardContent>
                      <Typography variant="h5" component="div">
                        {flashcard.name}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
      <br />
      <br />
      <br />
      <Footer />
    </Box>
  );
};

export default Page;