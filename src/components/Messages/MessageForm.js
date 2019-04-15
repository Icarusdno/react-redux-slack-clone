import React from 'react';
import uuidv4 from 'uuid/v4';
import firebase from '../../firebase';
import { Segment, Button, Input } from 'semantic-ui-react';

import FileModal from './FileModal';
import ProgressBar from './ProgressBar';

class MessageForm extends React.Component {

  state = {
    message: '',
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    loading: false,
    errors: [],
    modal: false,
    uploadState: '',
    uploadTask: null,
    storageRef: firebase.storage().ref(),
    percentUploaded: 0
  }

  handleChange = ({ target: { name, value } }) => {
    this.setState({ [name]: value });
  }

  createMessage = (fileUrl = null) => {
    const { message, user } = this.state;
    const messageToSend = {
      timestamp: firebase.database.ServerValue.TIMESTAMP,
      user: {
        id: user.uid,
        name: user.displayName,
        avatar: user.photoURL
      }
    }

    if (fileUrl !== null) {
      messageToSend['image'] = fileUrl;
    } else {
      messageToSend['content'] = message;
    }

    return messageToSend;
  }

  sendMessages = () => {
    const { messagesRef } = this.props;
    const { message, channel } = this.state;

    if (message) {
      this.setState({ loading: true });
      messagesRef
        .child(channel.id)
        .push()
        .set(this.createMessage())
        .then(() => {
          this.setState({
            message: '',
            loading: false,
            errors: []
          })
        })
        .catch((error) => {
          this.setState(({ errors }) => {
            return {
              loading: false,
              errors: [
                ...errors,
                error
              ]
            }
          });
        })
    } else {
      this.setState(({ errors }) => {
        return {
          errors: [
            ...errors,
            { message: 'Add a message' }
          ]
        }
      });
    }
  }

  openModal = () => this.setState({ modal: true });

  closeModal = () => this.setState({ modal: false });

  uploadFile = (file, metadata) => {
    const { channel, storageRef } = this.state;

    const pathToUpload = channel.id;
    const ref = this.props.messagesRef;
    const filePath = `chat/public/${uuidv4()}.jpg`;

    this.setState({
      uploadState: 'uploading',
      uploadTask: storageRef.child(filePath).put(file, metadata)
    },
      () => {
        this.state.uploadTask.on('state_changed', (snap) => {
          const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          console.log(this.props.isProgressBarVisible);
          this.props.isProgressBarVisible(percentUploaded);
          this.setState({ percentUploaded });
        },
        (error) => {
          console.error(error);
          this.setState(({ errors }) => {
            return {
              errors: [
                ...errors,
                error
              ],
              uploadState: 'error',
              uploadTask: null
            }
          });
        },
        () => {
          this.state.uploadTask.snapshot.ref.getDownloadURL().then((downloadUrl) => {
            this.sendFileMessage(downloadUrl, ref, pathToUpload);
          })
          .catch((error) => {
            console.error(error);
            this.setState(({ errors }) => {
              return {
                errors: [
                  ...errors,
                  error
                ],
                uploadState: 'error',
                uploadTask: null
              }
            });
          })
        });
      }
    );
  }

  sendFileMessage = (fileUrl, ref, pathToUpload) => {
    ref.child(pathToUpload)
      .push()
      .set(this.createMessage(fileUrl))
      .then(() => {
        this.setState({ uploadState: 'done' });
      })
      .catch((error) => {
        this.setState(({ errors }) => {
          return {
            errors: [
              ...errors,
              error
            ]
          }
        });
      });
  }

  render() {
    const { errors, message, loading, modal, percentUploaded, uploadState } = this.state;

    return (
      <Segment className="message__form">
        <Input
          fluid
          name="message"
          value={message}
          className={
            errors.some((error) => error.message.includes('message')) ? 'error' : ''
          }
          onChange={this.handleChange}
          style={{ marginBottom: '0.7em' }}
          label={<Button icon="add"/>}
          labelPosition="left"
          placeholder="Write your message"
        />
        <Button.Group icon widths="2">
          <Button
            color="orange"
            content="Add Reply"
            disabled={loading}
            labelPosition="left"
            icon="edit"
            onClick={this.sendMessages}
          />
          <Button
            color="teal"
            content="Upload Media"
            disabled={uploadState === 'uploading'}
            labelPosition="right"
            icon="cloud upload"
            onClick={this.openModal}
          />
        </Button.Group>
        <FileModal
          modal={modal}
          closeModal={this.closeModal}
          uploadFile={this.uploadFile}
        />
        <ProgressBar
          uploadState={uploadState}
          percentUploaded={percentUploaded}
        />
      </Segment>
    );
  }
}

export default MessageForm;
