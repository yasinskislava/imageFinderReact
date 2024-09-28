import styled from 'styled-components';
import './App.css';
import Searchbar from './components/Searchbar';
import { Component } from 'react';
import { nanoid } from 'nanoid';

const LoadMore = styled.button`
    cursor: pointer;
    width: 140px;
    height: 30px;
    font-family: "Roboto";
    background-color: rgba(0,0,0,0.1);
    transition: 300ms;
    border: transparent;
    display: block;
    margin: auto;
    margin-bottom: 50px;
    &:hover {
      background-color: rgba(0,0,0,0.2);
      transform: scale(1.05);
    }
`;

const Loader = styled.span`
  color: black;
  font-family: Consolas, Menlo, Monaco, monospace;
  font-weight: bold;
  font-size: 78px;
  opacity: 0.8;

  &:before {
    content: "{";
    display: inline-block;
    animation: pulse 0.4s alternate infinite ease-in-out;
  }
  &:after {
    content: "}";
    display: inline-block;
    animation: pulse 0.4s 0.3s alternate infinite ease-in-out;
  }

  @keyframes pulse {
    to {
      transform: scale(0.8);
      opacity: 0.5;
    }
  }
`;
const ImageGallery = styled.ul`
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 20px;
    justify-content: center;
    li {
      img {
        width: 300px;
        height: auto; 
        transition: 250ms;
        cursor: pointer;
        &:hover {
          transform: scale(1.05);
        }
      } 
    }
   
`;

const Modal = styled.div`
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.8);
    position: fixed;
    box-sizing: border-box;
    img {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      height: calc(100% - 100px);
      width: auto;
    }
`;

let check = true;

class App extends Component {
  state = {
    page: 1,
    props: "cat",
    list: [],
    show: false,
    activeUrl: "",
    hideButton: false,
    isDataLoading: true
  }
  
  getData() {
    this.setState({ isDataLoading: true });
    fetch(`https://pixabay.com/api/?page=${this.state.page}&key=43085062-83502d00c5fb8aeb01fe37f91&image_type=photo&orientation=horizontal&per_page=13&q=${this.state.props}`)
      .then(val => val.json())
      .then(val => {
        const tempRes = val.hits;
        if (tempRes.length < 13) {
          this.setState({ hideButton: true });
        }
        else {
          tempRes.pop();
        }
        console.log(tempRes);
        const tempArr = this.state.list;
        tempRes.map(image => {
          tempArr.push({ smallUrl: image.webformatURL, largeUrl: image.largeImageURL });
          return true;
        });

        this.setState({ list: tempArr, isDataLoading: false });
      });
  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.page !== this.state.page || prevState.props !== this.state.props) {
      this.getData();
    }
  }
  componentDidMount() {
    if (check) {
      this.getData();
      check = false;
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.setState({ show: false });
      }
    })
  }
  componentWillUnmount() {
    document.removeEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        this.setState({ show: false });
      }
    });
  }
  render() {
    return (
      <>
        {this.state.show ? <Modal onClick={(e) => { e.preventDefault(); this.setState({ show: false }) }}>
          <img src={this.state.activeUrl} alt="activeImage" />
        </Modal> : <></>}
        <Searchbar obj={this} />
        {this.state.isDataLoading ? <div style={{ display: "flex", justifyContent: "center", width: "100%", height: "100px", alignItems: "center" }}><Loader /></div> : <ImageGallery>
          {this.state.list.map(item => {
            return <li onClick={(e) => { e.preventDefault(); this.setState({ show: true, activeUrl: item.largeUrl }) }} key={nanoid()}>
              <img src={item.smallUrl} alt="item" />
            </li>
          })}
        </ImageGallery>}
        {(this.state.hideButton || this.state.isDataLoading) ? <></> : <LoadMore onClick={(e) => { e.preventDefault(); this.setState((prevState) => ({ page: prevState.page + 1 })) }}>Load more</LoadMore >}
      </>
      );
  }
}

export default App;
