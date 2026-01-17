
import firebase from 'firebase/app';
import 'firebase/firestore';
import { collection, addDoc, doc ,setDoc ,getDocs} from 'firebase/firestore';
import { firestore } from './firebase';

// Fetch all polylines from Firestore 'pipelines' collection
export const fetchPolylinesFromFirestore = async () => {
  try {
    const polylinesCollection = collection(firestore, 'pipelines');
    const querySnapshot = await getDocs(polylinesCollection);
    const polylinesArray = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      // If the polyline is stored as {coordinates: [{latitude, longitude}, ...]}, convert to [[lat, lng], ...]
      if (data.coordinates && Array.isArray(data.coordinates)) {
        polylinesArray.push(
          data.coordinates.map(coord => [coord.latitude, coord.longitude])
        );
      } else if (Array.isArray(data) && data.length === 2 && Array.isArray(data[0]) && Array.isArray(data[1])) {
        // Already in [[lat, lng], [lat, lng]] format
        polylinesArray.push(data);
      } else if (Array.isArray(data)) {
        polylinesArray.push(data);
      }
    });
    return polylinesArray;
  } catch (error) {
    console.error('Error fetching polylines from Firestore:', error);
    return [];
  }
};

export const uploadJSONToFirestore = async (jsonData) => {
  try {
    const collectionRef = collection(firestore, 'waternetwork'); // Replace 'your_collection_name' with your actual Firestore collection name

    // Iterate over each object in the jsonData array and add it as a separate document
    for (const data of jsonData) {
      await addDoc(collectionRef, data);
    }

    console.log('JSON data uploaded to Firestore successfully');
  } catch (error) {
    console.error('Error uploading JSON data to Firestore:', error);
  }
};


export const uploadJSONDynamically = async (nodeData) => {
    try {
      const collectionRef = collection(firestore, 'waternetwork'); // Replace 'waternetwork' with your actual Firestore collection name
  
      // Add a new document with Firestore's auto-generated document ID
      await addDoc(collectionRef, nodeData);
  
      console.log('Node data uploaded to Firestore successfully');
    } catch (error) {
      console.error('Error uploading node data to Firestore:', error);
    }
  };


  export const uploadPolylinesToFirestore = async (polylinesData) => {
    try {
      polylinesData.forEach(async (polyline) => {
        const collectionRef = collection(firestore, 'pipelines'); // Replace 'polylines' with your actual Firestore collection name
        await addDoc(collectionRef, polyline);
      });
  
      console.log('Polylines uploaded to Firestore successfully');
    } catch (error) {
      console.error('Error uploading polylines to Firestore:', error);
    }
  };

  export const fetchNodeDataFromFirestore = async () => {
    try {
      const nodeDataCollection = collection(firestore, 'waternetwork');
      const querySnapshot = await getDocs(nodeDataCollection);
      const nodeDataArray = [];
  
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        nodeDataArray.push(data);
      });
  
      return nodeDataArray;
    } catch (error) {
      console.error('Error fetching node data from Firestore:', error);
      throw error;
    }
  };