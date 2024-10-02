import styled from 'styled-components';
import './App.css';
import Searchbar from './components/Searchbar';
import { PureComponent } from 'react';
import arrowLeft from "./arrow-left.svg";
import arrowRight from "./arrow-right.svg";

const main = document.querySelector("body");

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
    z-index: 999;
    .image {
      position: fixed;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%);
      height: calc(100% - 100px);
      width: auto;
    }
    
`;

let check = true;

class App extends PureComponent {
  state = {
    page: 1,
    props: "cat",
    list: [],
    show: false,
    activeIndex: 0,
    hideButton: false,
    isDataLoading: true
  }
  checkIs(value) {
    if (value === undefined) {
      return 0;
    }
    else {
      return 1;
    }
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
        const tempArr = this.state.list;
        tempRes.map(image => {
          tempArr.push({ smallUrl: image.webformatURL, largeUrl: image.largeImageURL, key: image.id });
          return true;
        });

        this.setState({ list: tempArr, isDataLoading: false });
      });
  }
  componentDidUpdate(prevProps, prevState) {
    console.log(main.scrollTop, main.scrollHeight, main);
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
      if (e.key === "ArrowLeft") {
        this.setState((prevState) => ({activeIndex: Math.max(0, prevState.activeIndex - 1)}))
      }
      if (e.key === "ArrowRight") {
        this.setState((prevState) => ({activeIndex: prevState.activeIndex + this.checkIs(this.state.list[this.state.activeIndex+1])}))
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
        {this.state.show ? <Modal onClick={(e) => { e.preventDefault(); if (e.target.tagName === "DIV") { this.setState({ show: false }) } }}>
          <img src={arrowLeft} alt="arrow" style={{cursor: "pointer" ,position: "absolute", top: "50%", transform: "translateY(-50%)", left: "5%", width: "50px", height: "auto"}} onClick={() => {this.setState((prevState) => ({activeIndex: Math.max(0, prevState.activeIndex - 1)}))}} />
          <Loader style={{color: "white", position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)"}}></Loader>
          <img className="image" src={this.state.list[this.state.activeIndex].largeUrl} alt="activeImage" />
          <img src={arrowRight} alt="arrow" style={{cursor: "pointer" ,position: "absolute", top: "50%", transform: "translateY(-50%)", right: "5%", width: "50px", height: "auto"}} onClick={() => {this.setState((prevState) => ({activeIndex: prevState.activeIndex + this.checkIs(this.state.list[this.state.activeIndex+1])}))}} />
        </Modal> : <></>}
        <Searchbar obj={this} />
        {this.state.isDataLoading ? <div style={{ display: "flex", justifyContent: "center", width: "100%", height: "100px", alignItems: "center" }}><Loader /></div> : <ImageGallery>
          {this.state.list.length === 0 ? <p>No images were found</p> : <></>}
          {this.state.list.map(item => {
            return <li onClick={(e) => {
              e.preventDefault(); for (let i = 0; i < this.state.list.length; i++){
                if (this.state.list[i].smallUrl === item.smallUrl) {
                  this.setState({ show: true, activeIndex: i })
              }
            }  }} key={item.key}>
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
