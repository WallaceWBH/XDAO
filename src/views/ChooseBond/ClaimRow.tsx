import { useDispatch } from "react-redux";
import { t } from "@lingui/macro";
import { trim, prettyVestingPeriod } from "../../helpers";
import { redeemBond } from "../../slices/BondSlice";
import BondLogo from "../../components/BondLogo";
import { Box, Button, TableCell, TableRow, Typography } from "@material-ui/core";
import "./choosebond.scss";
import { Skeleton } from "@material-ui/lab";
import { useWeb3Context, useBonds, useAppSelector } from "src/hooks";
import { isPendingTxn, txnButtonTextGeneralPending } from "src/slices/PendingTxnsSlice";
import { IUserBondDetails } from "src/slices/AccountSlice";

export function ClaimBondTableData({ userBond }: { userBond: [string, IUserBondDetails] }) {
  const dispatch = useDispatch();
  const { address, provider } = useWeb3Context();
  const networkID = useAppSelector(state => state.network.networkId);
  const { bonds, expiredBonds } = useBonds(networkId);

  const bond = userBond[1];
  const bondName = bond.bond;

  const isAppLoading = useAppSelector(state => state.app.loading ?? true);

  const currentBlock = useAppSelector(state => {
    return state.app.currentBlock || 0;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    return prettyVestingPeriod(currentBlock, bond.bondMaturationBlock);
  };

  async function onRedeem({ autostake }: { autostake: boolean }) {
    // TODO (appleseed-expiredBonds): there may be a smarter way to refactor this
    let currentBond = [...bonds, ...expiredBonds].find(bnd => bnd.name === bondName);
    await dispatch(redeemBond({ address, bond: currentBond!, networkID, provider, autostake }));
  }

  return (
    <TableRow id={`${bondName}--claim`}>
      <TableCell align="left" className="bond-name-cell">
        <BondLogo bond={bond} />
        <div className="bond-name">
          <Typography variant="body1">
            {/* 0xdavinchee: we were previously trimmming the bond display name-I don't think this was the intent */}
            {bond.displayName ? bond.displayName : <Skeleton width={100} />}
          </Typography>
        </div>
      </TableCell>
      <TableCell align="center">
        {bond.pendingPayout ? trim(Number(bond.pendingPayout), 4) : <Skeleton width={100} />}
      </TableCell>
      <TableCell align="center">{bond.interestDue ? trim(bond.interestDue, 4) : <Skeleton width={100} />}</TableCell>
      <TableCell align="right" style={{ whiteSpace: "nowrap" }}>
        {isAppLoading ? <Skeleton /> : vestingPeriod()}
      </TableCell>
      <TableCell align="right">
        <Button
          variant="outlined"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bondName)}
          onClick={() => onRedeem({ autostake: false })}
        >
          <Typography variant="h6">
            {txnButtonTextGeneralPending(pendingTransactions, "redeem_bond_" + bondName, "Claim")}
          </Typography>
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function ClaimBondCardData({ userBond }: { userBond: [string, IUserBondDetails] }) {
  const dispatch = useDispatch();
  const { address, provider } = useWeb3Context();
  const networkID = useAppSelector(state => state.network.networkId);
  const { bonds, expiredBonds } = useBonds(networkId);

  const bond = userBond[1];
  const bondName = bond.bond;

  const currentBlock = useAppSelector(state => {
    return state.app.currentBlock || 0;
  });

  const pendingTransactions = useAppSelector(state => {
    return state.pendingTransactions;
  });

  const vestingPeriod = () => {
    return prettyVestingPeriod(currentBlock, bond.bondMaturationBlock);
  };

  async function onRedeem({ autostake }: { autostake: boolean }) {
    // TODO (appleseed-expiredBonds): there may be a smarter way to refactor this
    let currentBond = [...bonds, ...expiredBonds].find(bnd => bnd.name === bondName);
    await dispatch(redeemBond({ address, bond: currentBond!, networkID, provider, autostake }));
  }

  return (
    <Box id={`${bondName}--claim`} className="claim-bond-data-card bond-data-card" style={{ marginBottom: "30px" }}>
      <Box className="bond-pair">
        <BondLogo bond={bond} />
        <Box className="bond-name">
          <Typography>{bond.displayName ? trim(bond.displayName as any, 4) : <Skeleton width={100} />}</Typography>
        </Box>
      </Box>

      <div className="data-row">
        <Typography>Claimable</Typography>
        <Typography>{bond.pendingPayout ? trim(Number(bond.pendingPayout), 4) : <Skeleton width={100} />}</Typography>
      </div>

      <div className="data-row">
        <Typography>Pending</Typography>
        <Typography>{bond.interestDue ? trim(bond.interestDue, 4) : <Skeleton width={100} />}</Typography>
      </div>

      <div className="data-row" style={{ marginBottom: "20px" }}>
        <Typography>Fully Vested</Typography>
        <Typography>{vestingPeriod()}</Typography>
      </div>
      <Box display="flex" justifyContent="space-around" alignItems="center" className="claim-bond-card-buttons">
        <Button
          variant="outlined"
          color="primary"
          disabled={isPendingTxn(pendingTransactions, "redeem_bond_" + bondName)}
          onClick={() => onRedeem({ autostake: false })}
        >
          <Typography variant="h5">
            {txnButtonTextGeneralPending(pendingTransactions, "redeem_bond_" + bondName, t`Claim`)}
          </Typography>
        </Button>
        <Button variant="outlined" color="primary" onClick={() => onRedeem({ autostake: true })}>
          <Typography variant="h5">
            {txnButtonTextGeneralPending(
              pendingTransactions,
              "redeem_bond_" + bondName + "_autostake",
              t`Claim and Stake`,
            )}
          </Typography>
        </Button>
      </Box>
    </Box>
  );
}