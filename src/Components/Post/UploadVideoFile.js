import React, { useState } from 'react'
import Button from '@material-ui/core/Button';
import { database, storage } from '../../firebase';
import VideocamRoundedIcon from '@material-ui/icons/VideocamRounded';
import Alert from '@material-ui/lab/Alert';
import { makeStyles } from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import '../Styles/uploadBtn.css'
import {v4 as uuidv4} from 'uuid'

const useStyles = makeStyles((theme) => ({
    uploadBtn: {
        height: '70%',
        width: 150,
        fontSize: 18
    }

}));

function UploadVideoFile(props) {
    console.log("Upload Video Starts ");
    // console.log(props);
    const classes = useStyles();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const type = ['video/mp4', 'video/webm', 'video/ogg']

    const handleVideoFile = (e) => {
        const file = e?.target?.files[0];

        if (!file) {
            setError("Please select a file.");
            console.log("Please select a file.");
            setTimeout(() => {
                setError(null)
            }, 2000)
            return
        }

        if (type.indexOf(file.type) == -1) {
            setError("Please select a video file.");
            console.log("Please select a video file.");
            setTimeout(() => {
                setError(null)
            }, 2000)
            return
        }

        if (file.size / (1024 * 1024) > 100) {
            setError("The file size is too big to upload");
            console.log("Please select a small file.");
            setTimeout(() => {
                setError(null);
            }, 2000)
            return
        }
        
        try{
            setLoading(true);
            const id = uuidv4();
            const uploadVideoTask = storage.ref(`/posts/${props.userData.Uid}/videos/${file.name}`).put(file);
            uploadVideoTask.on("state changed", fn1, fn2, fn3);

            function fn1(snapshot) {
                var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                console.log('Upload is ' + progress + '% done');  // tell us the percent of work completed
            }

            function fn2(error) {
                setError(error);
                setTimeout(() => {
                    setError(null)
                }, 2000);
                setLoading(false)
            }

            async function fn3(){
                console.log("Uploading video ");
                const videoURL = await uploadVideoTask.snapshot.ref.getDownloadURL();
                console.log("video url: ", videoURL);
                const docRef = await database.posts.add({    // add?
                    PostId: id,
                    PostUrl: videoURL,
                    Type: "video",
                    UserId: props.userData.Uid,
                    UserName: props.userData.Username,
                    UserProfile: props.userData.ProfileUrl,
                    Comment:[],
                    Likes: [],
                    CreatedAt: database.getCurrentTimeStamp()
                })
                const res = await database.users.doc(props.userData.Uid).update({
                    Posts: [...props.userData.Posts, docRef.id]
                })
                console.log("result", res);
                console.log("DocRef", docRef);

                setLoading(false);
            }

        }
        catch(e){
            setError(e);
            setTimeout(()=>{
                setError(null);
            }, 2000);
            setLoading(false);
        }
    }

    return (
        <>
            <div className='upload'>
                {error != null ? <Alert severity="error">{error}</Alert> : <>
                    <input
                        // className={classes.input}
                        style={{ display: 'none' }}
                        id="icon-button-file"
                        type="file"
                        onChange={handleVideoFile}
                    />
                    <label htmlFor="icon-button-file">
                        <Button
                            className={classes.uploadBtn}
                            variant="contained"
                            color="secondary"
                            component="span"
                            size='medium'
                            disabled={loading}
                            startIcon={<VideocamRoundedIcon style={{ fontSize: 30 }} />}
                        >
                            Video
                        </Button>
                        {loading ? <LinearProgress /> : <></>}
                    </label>
                </>
                }
            </div>
        </>

    )
}

export default UploadVideoFile
