import { Connection,clusterApiUrl, PublicKey, SystemProgram, Keypair } from '@solana/web3.js';
import { Program, AnchorProvider, web3, utils } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import { tests }  from './TestBlogs';
import idl from './idl.json';
import './App.css';
import { Buffer } from 'buffer/';

window.Buffer =  Buffer;
const programID = new PublicKey(idl.metadata.address)
const network = clusterApiUrl('devnet')

const opts = {
  preFlightCommitment : 'processed'
}

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [post, setPost] = useState([]);
  const [registered, setRegistered] = useState(false);
  const [baseAccounts , setBaseAccounts] = useState();
  const [baseAccount, setBaseAccount] = useState({});
  

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
        getBaseAccounts()
      }
    }else{
      console.log('Solana Object not found !, get a Phantom wallet ! ')
    }
    } catch (error) {
      console.error(error)
    }
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preFlightCommitment)
    const provider = new AnchorProvider(connection, window.solana, opts.preFlightCommitment)
    return provider;
  }

  const connectWallet = async() => {
    const { solana } = window;
    const response = await solana.connect()
    console.log('Connected with Public Key : ', response.publicKey.toString())
    setWalletAddress(response.publicKey.toString())
    getBaseAccounts()
  }

  const loginBaseAccount = async() => {
      const provider = getProvider();
      const baseAccount = baseAccounts.filter((account)=> account.admin.toString() === provider.wallet.publicKey.toString());
      if(baseAccount[0] !== undefined){
        setBaseAccount(baseAccount[0].pubkey)
        setRegistered(true)
      }
      else{
        createBaseAccount();
      }
  }

  const getBaseAccounts = async() => {
    const connection = new Connection(network, opts.preFlightCommitment);
    const provider = getProvider();
    const program = new Program(idl, programID, provider);
    Promise.all(
      (await connection.getProgramAccounts(programID,{
        filters: [
          {
            dataSize: 100, 
          },
        ]})).map(
        async (baseAccount) => ({
          ...(await program.account.baseAccount.fetch(baseAccount.pubkey)),
          pubkey: baseAccount.pubkey,
        }) 
      )
    ).then((baseAccount)=> {
      setBaseAccounts(baseAccount)
      console.log(baseAccount)
    })
  }

  const createBaseAccount = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl,programID,provider);
      const [baseAccount] = await PublicKey.findProgramAddressSync(
        [
          utils.bytes.utf8.encode("POST_DEMO"),
          provider.wallet.publicKey.toBuffer(),
        ],
        program.programId
      )
      await program.rpc.create({
        accounts:{
          baseAccount,
          user : provider.wallet.publicKey,
          systemProgram : SystemProgram.programId
       },
      })
      console.log("Created a base account with address: ", baseAccount.toString())
      setBaseAccount(baseAccount)
      setRegistered(true)
    } catch (error) {
      console.log("Error creating account", error)
    }
  }

  const AddBlog = async(event) => {
    event.preventDefault()
    if(title.length > 0 && body.length > 0){
      console.log(title,body);
      try {
        const blog_account = Keypair.generate()
        const provider = getProvider()
        const program = new Program(idl, programID, provider)
        await program.rpc.addBlog(title,body,{
          accounts:{
            blogAccount: blog_account.publicKey,
            baseAccount: baseAccount,
            user: provider.wallet.publicKey,
            systemProgram: SystemProgram.programId
          },
          signers: [blog_account]
        })
        console.log("Added Blog Successfully")
      } catch (error) {
        console.error(error)
      }
    }
    else{
      console.log('Empty Input! Try Again')
    }
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
            <button className="self-center h-10 w-60 my-5 rounded-xl bg-blue-600 text-cyan-50 font-medium text-center" 
            onClick={loginBaseAccount}>
            Login / Signup</button>
        }
        <div className='self-center flex flex-col w-1/3'>
          {post.map((post,index)=>(
            <Post key={index} title = {post.title} body = {post.body}/>
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
