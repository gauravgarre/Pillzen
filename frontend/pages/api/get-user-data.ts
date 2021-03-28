import { NextApiRequest, NextApiResponse } from "next";
import verifyIdToken from "../../src/auth/verify-token-id";
import * as admin from "firebase-admin";

const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY;
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      // https://stackoverflow.com/a/41044630/1332513
      privateKey: firebasePrivateKey.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { token } = req.headers;
  const { uid } = await verifyIdToken(token.toString()); //checking if the user is authenticated

  //getting user info from the database
  const doc = await db
    .collection("UserData")
    .doc(uid) //getting user info document by their email
    .get();

  if (!doc.exists) {
    res.status(404).send("404 User not found");
  } else {
    res.json(doc.data());
  }
};
