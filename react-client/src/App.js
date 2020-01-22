import React from 'react';
import CommandInput from './CommandInput'
import './App.css'
import { List } from "react-virtualized";

// https://stackoverflow.com/questions/39600808/how-to-measure-a-rows-height-in-react-virtualized-list
// is this an easier way?

class App extends React.Component {

  state = {
    gameText: [],
    connected: false
  }

  componentDidMount() {
    window.ipcRenderer.on('message', (event, message) => {
      const { detail, type } = message
      if (type === "gametext") {
        return this.addGameText(detail)
      }
      console.log(message)
    })
  }

  componentDidUpdate(prevProps, prevState) {
    const { gameText } = this.state;
    const { gameText: prevGameText } = prevState;
    if (gameText.length !== prevGameText.length) {
      this.refs.gameTextList.scrollToRow(gameText.length);
    }
  }

  addGameText = gameString => {
    gameString = gameString.replace(/^\s*\r\n/g, "")
    if (gameString.match(/^\s*\r?\n$/)) return
    gameString = gameString.replace(/<pushBold\/>/g, "<strong>")
    gameString = gameString.replace(/<popBold\/>/g, "</strong>")
    gameString = gameString.replace(/<output class="mono"\/>/g, "<div class='monospace'>")
    gameString = gameString.replace(/<output class=""\/>/g, "</div>")
    console.log('gameString is:', gameString)
    return this.setState({ gameText: [...this.state.gameText, gameString] })
  }

  sendCommand = str => {
    this.addGameText(">" + str)
    window.ipcRenderer.send('asynchronous-message', str)
  }

  rowRenderer = ({
    key, // Unique key within array of rows
    index, // Index of row within collection
    isScrolling, // The List is currently being scrolled
    isVisible, // This row is visible within the List (eg it is not an overscanned row)
    style // Style object to be applied to row (to position it)
  }) => {
    return (
      <div key={key} style={style} className="game-text" dangerouslySetInnerHTML={{ __html: this.state.gameText[index] }}>
        {/* {this.state.gameText[index]} */}
      </div>
    );
  }

  testHeight = ({ index }) => {
    this.refs.measure.innerHTML = this.state.gameText[index]
    return this.refs.measure.clientHeight
  }

  render() {
    return (
      <div className="App">
        <div style={{ height: "90vh", overflowY: "auto" }}>
          <List
            ref='gameTextList'
            width={1000}
            height={1000}
            rowCount={this.state.gameText.length}
            rowHeight={this.testHeight}
            rowRenderer={this.rowRenderer}
            tabIndex="-1"
          />
        </div>
        <div ref="measure" id="measurer-div" className="game-text"></div>
        <CommandInput sendCommand={this.sendCommand} />
      </div >
    );
  }
}

export default App;
