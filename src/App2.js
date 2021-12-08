import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 50px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img`
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 4px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 100%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function MintCompleted({ config }) {
  return (
    <>
      <s.TextTitle style={{ textAlign: "center", color: "var(--accent-text)" }}>
        The sale has ended.
      </s.TextTitle>
      <s.TextDescription
        style={{ textAlign: "center", color: "var(--accent-text)" }}
      >
        You can still find {config.NFT_NAME} on
      </s.TextDescription>
      <s.SpacerSmall />
      <StyledLink target={"_blank"} href={config.MARKETPLACE_LINK}>
        {config.MARKETPLACE}
      </StyledLink>
    </>
  );
}

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(
    `Select how many SOCKS! , then BUY your SOCKS!`
  );
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Washing and Drying your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Your ${CONFIG.NFT_NAME} are fresh from the dryer! Visit Opensea.io to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 10) {
      newMintAmount = 10;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  useEffect(() => {
    dispatch(connect({ silent: true }));
  }, []);

  let walletNotConnected =
    blockchain.account === "" || blockchain.smartContract === null;

  let saleEnded = Number(data.totalSupply) >= CONFIG.MAX_SUPPLY;

  return (
    <>
      <div className="wrap">
        <nav className="p-3">
          <div className="d-flex justify-content-center align-items-center">
            <div></div>
            <div className="d-flex justify-content-center">
              <div className="logo logo--header"></div>
              <div className="h4">BasicNeeds</div>
            </div>
            {walletNotConnected ? (
              <>
                <p>Connect to the {CONFIG.NETWORK.NAME} network</p>
                <button
                  className="btn btn-secondary ml-auto"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    dispatch(connect());
                    getData();
                  }}
                >
                  Connect Wallet
                </button>
              </>
            ) : (
              <button
                className="btn btn-secondary ml-auto"
                type="button"
                disabled
                onClick={(e) => {
                  e.preventDefault();
                  dispatch(connect());
                  getData();
                }}
              >
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </button>
            )}
          </div>
        </nav>
        <main className="fluid-container">
          <section className="section-1 p-3" style={{ marginBottom: "4rem" }}>
            <div className="d-flex flex-column align-items-center">
              <h2 className="p-3">A Better Way To Send Donations</h2>
              <h6 className="font-weight-bold">
                100% of Basic Needs: SOCKS! revenue goes directly to purchasing
                Socks for shelters around the US.
              </h6>
              <p className="w-75 mb-5">
                Each transaction is transparent, and all ETH may be found at
                socks.basicneeds.eth where donation receipts will be saved as an
                NFT [Collection Coming Soon] to showcase complete transparency
                of your charitable spirit!
              </p>

              <div className="mint-card card d-flex flex-column align-items-center p-5">
                {walletNotConnected ? (
                  <>
                    <div>
                      <button
                        className="btn btn-secondary ml-auto"
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          dispatch(connect());
                          getData();
                        }}
                      >
                        Connect Wallet
                      </button>
                    </div>
                      {blockchain.errorMsg !== "" ? (
                        <div>
                          <s.SpacerSmall />
                          <s.TextDescription
                            style={{
                              textAlign: "center",
                              color: "red",
                            }}
                          >
                            {blockchain.errorMsg}
                          </s.TextDescription>
                        </div>
                      ) : null}
                  </>
                ) : saleEnded ? (
                  <MintCompleted config={CONFIG} />
                ) : (
                  <>
                    <div className="count h1 text-accent font-weight-bold">
                      {data.totalSupply}/{CONFIG.MAX_SUPPLY}
                    </div>
                    <hr />
                    <div className="price">
                      <span className="font-weight-bold">
                        {CONFIG.DISPLAY_COST} {CONFIG.NETWORK.SYMBOL}
                      </span>{" "}
                      / GOSOCK
                    </div>
                    <small className="font-italic mb-4">
                      (GAS NOT INCLUDED)
                    </small>
                    <button
                      type="button"
                      className="btn btn-primary font-weight-bold"
                      disabled={claimingNft ? 1 : 0}
                      onClick={(e) => {
                        e.preventDefault();
                        claimNFTs();
                        getData();
                      }}
                    >
                      {claimingNft ? "BUSY" : "MINT"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </section>
          <section className="section-2 p-5">
            <div className="rotated-square"></div>
            <div className="d-flex flex-column align-items-center">
              <h2>Meet the SOCKS! Team</h2>
              <p className="mb-4">
                SOCKS! was brought to you by these individuals of a larger
                collaboration with <a href="basicneeds">Basic Needs</a>.
              </p>
              <div className="row">
                <div className="col mb-5">
                  <div className="person-image person-image--1 mb-3"></div>
                  <div className="h5">Chelsea</div>
                  <div className="text-accent">Artistic Director</div>
                </div>
                <div className="col mb-5">
                  <div className="person-image person-image--2 mb-3"></div>
                  <div className="h5">Pandora</div>
                  <div className="text-accent">Web Designer</div>
                </div>
                <div className="col mb-5">
                  <div className="person-image person-image--3 mb-3"></div>
                  <div className="h5">Ryan</div>
                  <div className="text-accent">Web3 Developer</div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
      <footer>
        <div className="d-flex flex-column align-items-center p-3">
          <div className="d-flex justify-content-center">
            <div className="logo"></div>
            <div className="h6">BasicNeeds</div>
          </div>
        </div>
      </footer>
    </>
  );

  // return (
  //   <s.Screen>
  //     <s.Container
  //       flex={1}
  //       ai={"center"}
  //       style={{ padding: 24, backgroundColor: "var(--primary)" }}
  //       image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
  //     >
  //       <StyledLogo alt={"logo"} src={"/config/images/logo.png"} />
  //       <s.SpacerSmall />
  //       <ResponsiveWrapper flex={1} style={{ padding: 24 }} test>
  //         <s.Container flex={1} jc={"center"} ai={"center"}>
  //           <StyledImg alt={"example"} src={"/config/images/example.gif"} />
  //         </s.Container>
  //         <s.SpacerLarge />
  //         <s.Container
  //           flex={2}
  //           jc={"center"}
  //           ai={"center"}
  //           style={{
  //             backgroundColor: "var(--accent)",
  //             padding: 24,
  //             borderRadius: 24,
  //             border: "4px dashed var(--secondary)",
  //             boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.7)",
  //           }}
  //         >
  //           <s.TextTitle
  //             style={{
  //               textAlign: "center",
  //               fontSize: 50,
  //               fontWeight: "bold",
  //               color: "var(--accent-text)",
  //             }}
  //           >
  //             {data.totalSupply} / {CONFIG.MAX_SUPPLY}
  //           </s.TextTitle>
  //           <s.TextDescription
  //             style={{
  //               textAlign: "center",
  //               color: "var(--primary-text)",
  //             }}
  //           >
  //             <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
  //               {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
  //             </StyledLink>
  //           </s.TextDescription>
  //           <s.SpacerSmall />
  //           {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
  //             <>
  //               <s.TextTitle
  //                 style={{ textAlign: "center", color: "var(--accent-text)" }}
  //               >
  //                 The sale has ended.
  //               </s.TextTitle>
  //               <s.TextDescription
  //                 style={{ textAlign: "center", color: "var(--accent-text)" }}
  //               >
  //                 You can still find {CONFIG.NFT_NAME} on
  //               </s.TextDescription>
  //               <s.SpacerSmall />
  //               <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
  //                 {CONFIG.MARKETPLACE}
  //               </StyledLink>
  //             </>
  //           ) : (
  //             <>
  //               <s.TextTitle
  //                 style={{ textAlign: "center", color: "var(--accent-text)" }}
  //               >
  //                 1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
  //                 {CONFIG.NETWORK.SYMBOL}.
  //               </s.TextTitle>
  //               <s.SpacerXSmall />
  //               <s.TextDescription
  //                 style={{ textAlign: "center", color: "var(--accent-text)" }}
  //               >
  //                 Excluding gas fees.
  //               </s.TextDescription>
  //               <s.SpacerSmall />
  //               {blockchain.account === "" ||
  //               blockchain.smartContract === null ? (
  //                 <s.Container ai={"center"} jc={"center"}>
  //                   <s.TextDescription
  //                     style={{
  //                       textAlign: "center",
  //                       color: "var(--accent-text)",
  //                     }}
  //                   >
  //                     Connect to the {CONFIG.NETWORK.NAME} network
  //                   </s.TextDescription>
  //                   <s.SpacerSmall />
  //                   <StyledButton
  //                     onClick={(e) => {
  //                       e.preventDefault();
  //                       dispatch(connect());
  //                       getData();
  //                     }}
  //                   >
  //                     CONNECT
  //                   </StyledButton>
  //                   {blockchain.errorMsg !== "" ? (
  //                     <>
  //                       <s.SpacerSmall />
  //                       <s.TextDescription
  //                         style={{
  //                           textAlign: "center",
  //                           color: "var(--accent-text)",
  //                         }}
  //                       >
  //                         {blockchain.errorMsg}
  //                       </s.TextDescription>
  //                     </>
  //                   ) : null}
  //                 </s.Container>
  //               ) : (
  //                 <>
  //                   <s.TextDescription
  //                     style={{
  //                       textAlign: "center",
  //                       color: "var(--accent-text)",
  //                     }}
  //                   >
  //                     {feedback}
  //                   </s.TextDescription>
  //                   <s.SpacerMedium />
  //                   <s.Container ai={"center"} jc={"center"} fd={"row"}>
  //                     <StyledRoundButton
  //                       style={{ lineHeight: 0.4 }}
  //                       disabled={claimingNft ? 1 : 0}
  //                       onClick={(e) => {
  //                         e.preventDefault();
  //                         decrementMintAmount();
  //                       }}
  //                     >
  //                       -
  //                     </StyledRoundButton>
  //                     <s.SpacerMedium />
  //                     <s.TextDescription
  //                       style={{
  //                         textAlign: "center",
  //                         color: "var(--accent-text)",
  //                       }}
  //                     >
  //                       {mintAmount}
  //                     </s.TextDescription>
  //                     <s.SpacerMedium />
  //                     <StyledRoundButton
  //                       disabled={claimingNft ? 1 : 0}
  //                       onClick={(e) => {
  //                         e.preventDefault();
  //                         incrementMintAmount();
  //                       }}
  //                     >
  //                       +
  //                     </StyledRoundButton>
  //                   </s.Container>
  //                   <s.SpacerSmall />
  //                   <s.Container ai={"center"} jc={"center"} fd={"row"}>
  //                     <StyledButton
  //                       disabled={claimingNft ? 1 : 0}
  //                       onClick={(e) => {
  //                         e.preventDefault();
  //                         claimNFTs();
  //                         getData();
  //                       }}
  //                     >
  //                       {claimingNft ? "BUSY" : "BUY"}
  //                     </StyledButton>
  //                   </s.Container>
  //                 </>
  //               )}
  //             </>
  //           )}
  //           <s.SpacerMedium />
  //         </s.Container>
  //         <s.SpacerLarge />
  //         <s.Container flex={1} jc={"center"} ai={"center"}>
  //           <StyledImg
  //             alt={"example"}
  //             src={"/config/images/example.gif"}
  //             style={{ transform: "scaleX(-1)" }}
  //           />
  //         </s.Container>
  //       </ResponsiveWrapper>
  //       <s.SpacerMedium />
  //       <s.Container jc={"center"} ai={"center"} style={{ width: "70%" }}>
  //         <s.TextDescription
  //           style={{
  //             textAlign: "center",
  //             color: "var(--primary-text)",
  //           }}
  //         >
  //           Please make sure you are connected to the right network (
  //           {CONFIG.NETWORK.NAME} Mainnet) and the correct address. Please note:
  //           Once you make the purchase, you cannot undo this action.
  //         </s.TextDescription>
  //         <s.SpacerSmall />
  //         <s.TextDescription
  //           style={{
  //             textAlign: "center",
  //             color: "var(--primary-text)",
  //           }}
  //         >
  //           We have set the gas limit to {CONFIG.GAS_LIMIT} for the contract to
  //           successfully mint your NFT. We recommend that you don't lower the
  //           gas limit.
  //         </s.TextDescription>
  //       </s.Container>
  //     </s.Container>
  //   </s.Screen>
  // );
}

export default App;
