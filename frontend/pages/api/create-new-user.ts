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
  const { host, token } = req.headers;
  const { phoneNumber } = req.body;
  console.log(phoneNumber, "aaaaaaaaa");

  const userInfo = await verifyIdToken(token.toString()); //checking if the user is authenticated
  const { email, name, uid } = userInfo;
  //creating new document in the 'Users' field with the users name
  await db.collection("UserData").doc(uid).set({
    accountCreated: admin.firestore.Timestamp.now(),
    name: name,
    email: email,
    userUid: uid,
    phoneNumber,
  });
  res.status(201).json("Successful");
};
