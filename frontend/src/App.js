import { Connection,clusterApiUrl } from '@solana/web3.js';
import { Provider, web3 } from '@project-serum/anchor';
import { useEffect, useState } from 'react';
import './App.css';

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);

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
    return <></>
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    }
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad)
  },[])

  return (
    <div>
      {(walletAddress && renderNotConnectedContainer())}
    </div>
  );
}

export default App;
