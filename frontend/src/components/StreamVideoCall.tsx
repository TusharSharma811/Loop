import {
  StreamCall,
  StreamVideo,
  StreamVideoClient,
} from "@stream-io/video-react-sdk";
import useUserStore from '../store/userStore';


export const MyApp = () => {
const { user } = useUserStore();
const apiKey = "your-api-key";
const userId = user?.id;
const token = "authentication-token";

const client = new StreamVideoClient({ apiKey, user, token });
const call = client.call("default", "my-first-call");
call.join({ create: true });

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        /* <MyVideoUI /> */
      </StreamCall>
    </StreamVideo>
  );
};