import React from 'react';
import firebase from '../../firebase';
import { Segment, Comment } from 'semantic-ui-react';

import MessagesHeader from './MessagesHeader';
import MessageForm from './MessageForm';
import Message from './Message';

import './messages.css';

export default class Messages extends React.Component {

  state = {
    messagesRef: firebase.database().ref('messages'),
    channel: this.props.currentChannel,
    user: this.props.currentUser,
    messages: [],
    messagesLoading: true,
    progressBar: false,
    numUniqueUsers: '',
    searchTerm: '',
    searchLoading: false,
    searchResults: []
  }

  componentDidMount() {
    const { channel, user } = this.state;

    if (channel && user) {
      this.addListeners(channel.id);
    }
  }

  addListeners = (channelId) => {
    this.addMessageListener(channelId);
  }

  addMessageListener = (channelId) => {
    const loadedMessage = [];
    this.state.messagesRef.child(channelId).on('child_added', (snap) => {
      loadedMessage.push(snap.val());
      this.setState({
        messages: loadedMessage,
        messagesLoading: false
      });
      this.countUniqueUsers(loadedMessage);
    });
  }

  countUniqueUsers = (messages) => {
    const uniqueUsers = messages.reduce((acc, { user: { name } }) => {
      if (!acc.includes(name)) {
        acc.push(name);
      }
      return acc;
    }, []);
    const plural = uniqueUsers > 1 || uniqueUsers === 0;
    const numUniqueUsers = `${uniqueUsers.length} user${plural ? 's' : ''}`;
    this.setState({ numUniqueUsers });
  }

  displayMessages = (messages) => {
    if (messages.length)
      return messages.map((message) => (
        <Message
          key={message.timestamp}
          message={message}
          user={this.state.user}
        />
      ))
  };

  isProgressBarVisible = (percent) => {
    if (percent > 0) {
      this.setState({ progressBar: true })
    }
  }

  displayChannelName = (channel) => channel ? `#${channel.name}` : '';

  handleSearchChange = (event) => {
    this.setState({
      searchTerm: event.target.value,
      searchLoading: true
    }, () => this.handleSearchMessages());
  }

  handleSearchMessages = () => {
    const channelsMessages = [...this.state.messages];
    const regex = new RegExp(this.state.searchTerm, 'gi');
    const searchResults = channelsMessages.reduce((acc, message) => {
      if ((message.content && message.content.match(regex)) || message.user.name.match(regex)) {
        acc.push(message);
      }
      return acc;
    }, []);
    this.setState({ searchResults });
    setTimeout(() => this.setState({ searchLoading: false }), 700);
  }

  render() {
    const {
      messagesRef,
      messages,
      channel,
      user,
      progressBar,
      numUniqueUsers,
      searchTerm,
      searchResults,
      searchLoading
    } = this.state;

    return (
      <React.Fragment>
        <MessagesHeader
          channelName={this.displayChannelName(channel)}
          numUniqueUsers={numUniqueUsers}
          handleSearchChange={this.handleSearchChange}
          searchLoading={searchLoading}
        />

        <Segment>
          <Comment.Group className={progressBar ? 'messages__progress' : 'messages'}>
            {
              searchTerm ?
              this.displayMessages(searchResults) :
              this.displayMessages(messages)
            }
          </Comment.Group>
        </Segment>

        <MessageForm 
          messagesRef={messagesRef}
          currentChannel={channel}
          currentUser={user}
          isProgressBarVisible={this.isProgressBarVisible}
        />
      </React.Fragment>
    );
  }
}
