import React, {Component} from 'react';
import {StyleSheet, Text, View, Button} from 'react-native';
import moment from 'moment'

export default class App extends Component{
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      questions: {},
      startTime: '',
      endTime: '',
      index: 0,
      isStarted: false,
      loading: true
    }
    this.loadQuestions = this.loadQuestions.bind(this);
    this.playAgain = this.playAgain.bind(this);
  }

  playAgain() {
    this.setState({
      questions: {},
      startTime: '',
      endTime: '',
      index: 0,
      isStarted: false
    });
    this.loadQuestions();
  }

  componentDidMount() {
    this.loadQuestions();
  }

  loadQuestions() {
    // load 10 questions from Open Trivia Database API
    this.setState({ loading: true})
    return fetch('https://opentdb.com/api.php?amount=10&difficulty=medium&type=multiple')
     .then((response) => response.json())
     .then((responseJson) => {
       this.setState({questions: responseJson.results, loading: false});
     })
     .catch((error) => {
       console.error(error);
     });
  }

  async startQuiz() {
    await this.setState({ isStarted: true, startTime: new Date()})
  }

  async recordAnswer(answer) {
    const newArray = [...this.state.questions];
    newArray[this.state.index].answered = answer;
    await this.setState(prevState => ({ questions: newArray, index: prevState.index + 1}));
    if(this.state.index > this.state.questions.length - 1) {
      this.setState({ endTime: new Date() })
    }
  }

  renderQuestion(){
    if(!this.state.isStarted || (this.state.index === this.state.questions.length)){
      return null;
    }
    var questionData = this.state.questions[this.state.index]
    var incorrect = questionData.incorrect_answers
    incorrect.push(questionData.correct_answer)
    incorrect.sort();
    let answers = incorrect.map((answer, index) => {
      return <Button key={index}
        title={answer}
        style={styles.answerButton}
        color='#ccc'
        onPress={() => this.recordAnswer(answer)}
        />
    })
    return <View style={styles.questionView}>
      <Text style={styles.questionText}>{questionData.question}</Text>
      {answers}
    </View>
  }

  renderHeader() {
    if(this.state.isStarted && this.state.index <= this.state.questions.length - 1) {
      return <View style={styles.header}>
        <Text style={styles.questionCount}>Question: {this.state.index + 1} / {this.state.questions.length}</Text>
      </View>
    }
    return null;
  }

  renderShowAnswerButton() {
    let { questions, startTime, endTime } = this.state
    let score = questions.filter((que) => {
      return que.answered === que.correct_answer
    })
    let start = moment(startTime)
    let end = moment(endTime)
    let seconds = end.diff(start, 'seconds')
    const duration = moment.utc(seconds*1000).format('mm:ss');
    return <View>
      <Text style={styles.answerText}>Your score is {score.length} out of {questions.length}</Text>
      <Text style={styles.answerText}>Time Taken: {duration}</Text>
      <Button
          title="Play Again"
          style={styles.playAgain} 
          onPress={() => this.playAgain()} />
    </View>
  }

  renderStartButton(){
    if(this.state.isStarted) {
      return null;
    }
    return (
      <Button 
        title={(this.state.loading) ? 'Loading...': 'Start Quiz'}
        disabled={this.state.loading} 
        style={styles.playAgain} 
        onPress={() => this.startQuiz()} />
    )
  }

  render() {
    return (
      <View style={styles.container}>
        { this.renderHeader() }
        { this.renderStartButton() }
        { this.renderQuestion()}
        { (this.state.index > this.state.questions.length - 1) && this.renderShowAnswerButton()}

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position:'absolute',
    flexDirection: 'row',
    width:'100%',
    height:60,
    top:10,
    justifyContent:'space-between',
    padding:20
  },
  answerButton: {
    flex: 1,
    marginVertical: 5,
    justifyContent: 'space-between',
    paddingLeft:10
  },
  questionView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent:'center',
    width:'100%',
    padding:30
  },
  questionText: {
    marginBottom: 20,
    fontWeight:'bold'
  },
  questionCount: {
    fontWeight:'bold'
  },
  answerText: {
    marginBottom:30,
    fontWeight:'bold',
    textAlign: 'center'
  },
  playAgain: {
    width:100,
    alignSelf: 'center'
  }
});
