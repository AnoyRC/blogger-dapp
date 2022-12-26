import { Connection,clusterApiUrl } from '@solana/web3.js';
import { Provider, web3 } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import { tests }  from './TestBlogs';
import './App.css';

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [post, setPost] = useState([]);
  const [registered, setRegistered] = useState(true);

  const checkIfWalletIsConnected = async() => {
    try {
      const { solana } = window;
    if(solana){
      if(solana.isPhantom){
        console.log('Phantom wallet connected !')

        const response = await solana.connect({
          onlyIfTrusted : true
        })
        console.log('Connected with Public Key : ', response.publicKey.toString())
        setWalletAddress(response.publicKey.toString())
      }
    }else{
      console.log('Solana Object not found !, get a Phantom wallet ! ')
    }
    } catch (error) {
      console.error(error)
    }
  }

  const connectWallet = async() => {
    const { solana } = window;
    const response = await solana.connect()
    console.log('Connected with Public Key : ', response.publicKey.toString())
    setWalletAddress(response.publicKey.toString())
  }

  const AddBlog = (event) => {
    event.preventDefault()
    console.log(title,body);
    setTitle('');
    setBody('');
  }

  const renderNotConnectedContainer = () => {
    return (
      <div  className="flex flex-col bg-neutral-700 h-screen w-screen justify-center ">
        <h1 className="text-3xl font-normal self-center text-cyan-50 text-center">
          Welcome to the Web3 Blogger App ! <br/>
          Connect your wallet :)
        </h1>
        <button className="self-center h-10 w-40 mt-5 rounded-xl bg-blue-600 text-cyan-50 font-medium text-center" 
          onClick={connectWallet}>
           Connect Wallet
        </button>
      </div>
      );
  }

  const renderConnectedContainer = () => {
    return (
      <div  className="flex flex-col bg-neutral-700 ">
        <h1 className="text-3xl font-normal mt-10 self-center text-cyan-50 text-center">
          Welcome to the Web3 Blogger App ! 
        </h1>
        {(registered && 
          <form className='self-center flex flex-col w-1/3' onSubmit={AddBlog}>
            <input className="bg-neutral-500 h-10 w-full rounded-md text-lg mt-5 text-cyan-50" 
              value = {title} 
              onChange = {(e) => setTitle(e.target.value)} 
              type="text" 
              placeholder="Add title"></input><br />
            <textarea className='bg-neutral-500 rounded-md text-lg mt-5 text-cyan-50'
              value = {body} 
              onChange = {(e) => setBody(e.target.value)} 
              placeholder='Add Body' 
              rows="4" 
              cols="19"></textarea><br />
            <button className="self-center h-10 w-40 my-5 rounded-xl bg-blue-600 text-cyan-50 font-medium text-center" 
              type="submit">
              Add Post</button>
          </form>) ||
            <button className="self-center h-10 w-60 my-5 rounded-xl bg-blue-600 text-cyan-50 font-medium text-center" >
            Do a one time registration</button>
        }
        <div className='self-center flex flex-col w-1/3'>
          {post.map((post)=>(
            <Post title = {post.title} body = {post.body}/>
          ))}
        </div>
      </div>
    )
  }

  const Post = (props) => {
    return <div className='bg-neutral-600 rounded-xl my-3'>
      <h1 className='text-cyan-50 mx-3 my-4 text-4xl'>{props.title}</h1>
      <p className='text-cyan-50 mx-3 text-lg'>{props.body}</p>
      <div className='flex justify-center'>
        <button className="self-center h-10 w-40 my-5 rounded-xl bg-blue-600 text-cyan-50 mx-4 font-medium text-center" >
          Like
        </button>
        <button className="self-center h-10 w-40 my-5 rounded-xl bg-blue-600 text-cyan-50 mx-4 font-medium text-center" >
          Donate
        </button>
      </div>
    </div>
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    setPost(tests);
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  },[])

  return (
    <div>
      {(!walletAddress && renderNotConnectedContainer()) || renderConnectedContainer()}
    </div>
  );
}

export default App;
