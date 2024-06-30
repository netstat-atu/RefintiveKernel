import * as React from "react";

//** next */
import Head from "next/head";
import Router from "next/router";

//** mui */
import { alpha, Table, TableBody, TableCell, TableHead, Paper, TableRow, TableContainer, IconButton, Backdrop, Box, Button, Card, Checkbox, Chip, CircularProgress, Container, Divider, FormControl, InputLabel, MenuItem, Select, Stack, TablePagination, TextField, Toolbar, Tooltip, Typography, Grid } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
//** component */
import { DashboardLayoutUser } from "../../components/dashboard-layout-user";
import DynamicFieldDialog from "../../components/DynamicFieldDialog";
import StyledTableRow from "../../components/StyledTableRow";
import CButton from "../../components/CButton";

//** service */
import { consumerManageAPI, billerNameRequest, billerNameStates, consumerListAddComment, consumerListByFilter } from "../../utils/bbps/billerServices";
import { pathNameBaseOnStage } from "../../services/configHandle";

//** redux */
import { useDispatch, useSelector } from "react-redux";

//** utils */
import { BILLER_CATEGORY, convertToTitleCase, isEmpty, truncateString } from "../../utils";
import { ddmmyy, formatDate } from "../../utils/dateFormat";

//** hook */
import { openAlertSnack } from "../../redux/slice/alertSnackSlice";
import useAlertDialog from "../../hook/useAlertDialog";
import { useLoader } from "../../Provider/LoaderContext";
import BBPSLogo from "../../components/BBPSLogo";

const ConsumerListVerification = () => {

  const { userId, orgId, access } = useSelector((state) => state.user);
  const { orgField } = useSelector((state) => state.extra);
  const { showLoader, hideLoader } = useLoader();
  const enableAction = access?.isApprover;
  const alertDialog = useAlertDialog();
  const dispatch = useDispatch();

  const initialValue = {
    userId: userId,
    orgId: orgId,
    consumerNumber: "",
    billerName: "",
    consumerName: "",
    billerId: "",
    stateName: "",
    registrationDateFrom: "",
    registrationDateTo: "",
    rowPerPage: 10,
    pageNo: 0,
    active: 0,
    payType: "ALL",
  };

  //** state */
  const [consumerList, setConsumerList] = React.useState([]);
  const [dataLength, setDataLength] = React.useState(0);
  const [selected, setSelected] = React.useState([]);
  const [billerNameListData, setBillerNameListData] = React.useState([]);
  const [stateName, setStateName] = React.useState("");
  const [filterBody, setFilterBody] = React.useState(initialValue);
  const [stateList, setStateList] = React.useState([]);
  const [billerName, setBillerName] = React.useState("");
  const [clearFlag, setClearFlag] = React.useState(false);

  const handleChangePage = (event, newPage) => setFilterBody({ ...filterBody, pageNo: newPage });
  const handleChangeRowsPerPage = (event) => setFilterBody({ ...filterBody, rowPerPage: event.target.value });
  const onChangeHandle = (e) => setFilterBody({ ...filterBody, [e.target.name]: e.target.value });
  const isSelected = (name) => selected.indexOf(name) !== -1;
  const goToPage = (path) => Router.push(pathNameBaseOnStage(path));
  const openAlertHandle = (type = "success", message = "Message") => dispatch(openAlertSnack({ type: type, message: message }));


  const handleChangeBillerName = (event) => {
    setBillerName(event.target.value);
    let billerNameCode = event.target.value.split("/");
    setFilterBody({
      ...filterBody,
      ["billerName"]: billerNameCode[1],
      ["billerId"]: billerNameCode[0],
    });
  };

  const getBillerName = async () => {
    await billerNameRequest(BILLER_CATEGORY)
      .then((resp) => {
        if (resp?.length > 0) {
          setBillerNameListData(resp);
        } else {
          setBillerNameListData([]);
        }
      })
      .catch((error) => {
        console.log("🚀 ~ file: billStatus.js:156 ~ await billerNameRequest ~ error:", error);
        setBillerNameListData([]);
      });
  };

  const getBillerStatesList = async () => {
    await billerNameStates()
      .then((resp) => {
        if (resp?.length > 0) {
          setStateList([{ stateName: "All" }, ...resp]);
        } else {
          setStateList([]);
        }
      })
      .catch((error) => {
        console.log("🚀 ~ file: billStatus.js:120 ~ await billerNameStates ~ error:", error);
        setStateList([]);
      });
  };

  const consumerFilter = async () => {
    showLoader();
    await consumerListByFilter(filterBody)
      .then((resp) => {
        if (resp?.data) {
          setConsumerList(resp?.data);
          setDataLength(resp?.Counts);
        } else {
          setConsumerList([]);
          setDataLength(0);
        }
      })
      .catch((error) => {
        console.log("🚀 ~ file: consumerListVerification.js:180 ~ await consumerListByFilter ~ error:", error);
      })
      .finally(() => {
        hideLoader();
      });
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  const clearState = () => {
    setStateName("");
    setBillerName("");
    setFilterBody(initialValue);
    setClearFlag(!clearFlag);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const nSelected = consumerList.filter((n) => n.Active == 0);
      const newSelected = nSelected.map((n) => n.ID);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const activateConsumerStatus = async () => {
    const fetchedConsumers = consumerList.filter(
      (n) => selected.includes(n.ID) && n.fetchType == 0
    );
    const nonFetchedConsumers = consumerList.filter(
      (n) => selected.includes(n.ID) && n.fetchType == 1
    );

    const body = {
      type: "CONSUMER_STATUS_UPDATE",
      data: fetchedConsumers.map((n) => n.ID),
      active: 1,
      orgId: orgId,
    };
    await consumerManageAPI(body)
      .then((resp) => {

        if (resp?.statusCode === 200) {
          openAlertHandle("success", resp?.data);
        }
        setSelected([]);
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: consumerListVerification.js:266 ~ await consumerManageAPI ~ error:",
          error
        );
      })
      .finally(() => {
        consumerFilter();
      });

    if (nonFetchedConsumers?.length) {
      const body = {
        type: "CONSUMER_STATUS_UPDATE",
        data: nonFetchedConsumers.map((n) => n.ID),
        active: 2,
        orgId: orgId,
      };
      await consumerManageAPI(body)
        .then((resp) => {
        })
        .catch((error) => {
          console.log(
            "🚀 ~ file: consumerListVerification.js:284 ~ await consumerManageAPI ~ error:",
            error
          );
        })
        .finally(() => {
          consumerFilter();
        });
    }
  };
  const handleChangeStateName = async (event) => {
    showLoader();
    setBillerName("");
    setFilterBody({
      ...filterBody,
      [event.target.name]:
        event.target.value === "ALL" ? "" : event.target.value,
      billerId: "",
      billerName: "",
    });
    setStateName(event.target.value);
    await billerNameRequest(BILLER_CATEGORY, event.target.value)
      .then((resp) => {
        if (resp?.length > 0) {
          setBillerNameListData(resp);
        } else {
          setBillerNameListData([]);
        }
      })
      .catch((error) => {
        console.log(
          "🚀 ~ file: billStatus.js:145 ~ billerNameRequest ~ error:",
          error
        );
        setBillerNameListData([]);
      })
      .finally(() => {
        hideLoader();
      });
  };

  //** component */
  const EnhancedTableToolbar = (props) => {
    const { numSelected } = props;
    return (
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          ...(numSelected > 0 && {
            bgcolor: (theme) =>
              alpha(
                theme.palette.primary.main,
                theme.palette.action.activatedOpacity
              ),
          }),
        }}
      >
        {numSelected > 0 ? (
          <Typography
            sx={{ flex: "1 1 100%" }}
            color="inherit"
            variant="subtitle1"
            component="div"
          >
            {numSelected} selected
          </Typography>
        ) : (
          <Typography
            sx={{ flex: "1 1 100%" }}
            variant="h6"
            id="tableTitle"
            component="div"
          >
            Verify Consumer
          </Typography>
        )}

        {numSelected > 0 ? (
          <Tooltip title="Activate">
            <IconButton
              onClick={() => {
                alertDialog({
                  desc: "Are you sure you want to activate the consumer?",
                  rightButtonText: "Okay",
                  rightButtonFunction: () => {
                    activateConsumerStatus();
                  },
                });
              }}
              size="small"
              color="error"
            >
              <Chip label={"Activate"} color={"success"} variant="filled" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Toolbar>
    );
  };

  const ConsumerRow = ({ item, index }) => {
    const isItemSelected = isSelected(item.ID);
    const labelId = `enhanced-table-checkbox-${index}`;
    const consumerStatus = {
      0: "Inactive",
      1: "Active",
      2: "Active",
    };
    const consumerStatusColor = {
      0: "error",
      1: "success",
      2: "success",
    };

    const [comment, setComment] = React.useState(item?.comment);
    const [commentOpen, setCommentOpen] = React.useState(false);
    const handleCommentOpen = () => setCommentOpen(true);
    const handleCommentClose = () => {
      setComment(item?.comment)
      setCommentOpen(false)
    };
    const onCommentChange = event => setComment(event.target.value);

    const submitConsumerComment = async () => {
      showLoader()
      const body = {
        "orgId": orgId,
        "userId": userId,
        "ID": item.ID,
        "valueComment": comment
      }
      await consumerListAddComment(body).then((resp) => {
        if (resp?.statusCode === 200) {
          openAlertHandle("success", resp?.data);
        } else {
          openAlertHandle("error", resp?.data);
        }
      }).catch((error) => {
        openAlertHandle("error", JSON.stringify(error));
        console.log("🚀 ~ file: consumerList.js:365 ~ await consumerListAddComment ~ error:", error)
      }).finally(() => {
        handleCommentClose();
        hideLoader()
        consumerFilter()
      })
    }

    return (
      <StyledTableRow sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
        {enableAction && (
          <TableCell padding="checkbox">
            <Checkbox
              onClick={(event) => handleClick(event, item.ID)}
              color="primary"
              checked={isItemSelected}
              inputProps={{
                "aria-labelledby": labelId,
              }}
            />
          </TableCell>
        )}
        <TableCell align="center">{isEmpty(item.ConsumerId)}</TableCell>
        <TableCell align="center">{isEmpty(item.ConsumerName)}</TableCell>
        {orgField && orgField.length > 0
          ? orgField.map((field, index) => {
            if (field?.filterFlag === 1) {
              if (field?.fieldType === "char") {
                return (
                  <TableCell key={index} align="center">
                    {isEmpty(item[field?.fieldName])}
                  </TableCell>
                );
              }
            }
          })
          : null}
        <TableCell align="center">{isEmpty(item.BillerName)}</TableCell>
        <TableCell align="center">{isEmpty(item.BillerCategory)}</TableCell>
        <TableCell align="center">
          <Chip label={consumerStatus[item.Active]} color={consumerStatusColor[item.Active]} variant="outlined" />
        </TableCell>
        <TableCell align="center">
          <Button onClick={handleCommentOpen}>{isEmpty(truncateString(comment))}</Button>
        </TableCell>
        <TableCell align="center">{isEmpty(item.ConsumerType)}</TableCell>
        <DynamicFieldDialog open={commentOpen} handleClose={handleCommentClose} value={comment} label={"Your Comment"} onChange={onCommentChange} onSubmit={submitConsumerComment} />
      </StyledTableRow>
    );
  };

  React.useEffect(() => {
    getBillerStatesList();
    getBillerName();
  }, []);

  React.useEffect(() => {
    consumerFilter();
  }, [clearFlag, filterBody.rowPerPage, filterBody.pageNo]);

  return (
    <>
      <Head>
        <title>Verify Consumer List</title>
      </Head>
      <Stack component="main" spacing={3} p={3} >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }} >
          <Box>
            <Typography variant="h5" component="div">
              Verify Consumer
            </Typography>
            <CButton onClick={() => goToPage("/user/consumerRegistration")} title="Consumer Registration" />
          </Box>
          <BBPSLogo />
        </Box>
        <Card>
          <Box sx={{ display: "flex", justifyContent: "flex-start", p: 2 }}>
            <Typography variant="h6" component="div">
              Choose Filters
            </Typography>
          </Box>
          <Divider />
          <Stack component="form">
            <Grid container columns={{ xs: 2, sm: 8, md: 16 }}  >
              <Grid item xs={2} sm={4} md={4} p={1}>
                <TextField
                  fullWidth
                  value={filterBody.consumerNumber}
                  size="small"
                  onChange={onChangeHandle}
                  name="consumerNumber"
                  id="outlined-basic"
                  label="Consumer Number"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1}>
                <TextField
                  fullWidth
                  value={filterBody.consumerName}
                  size="small"
                  onChange={onChangeHandle}
                  name="consumerName"
                  id="outlined-basic"
                  label="Consumer Name"
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1}>
                <FormControl size="small" fullWidth>
                  <InputLabel id="singleBillerNameLabel">
                    Select State
                  </InputLabel>
                  <Select
                    required
                    labelId="singleBillerNameLabel"
                    id="singleBillerName"
                    value={stateName}
                    name="stateName"
                    label="Select State"
                    onChange={handleChangeStateName}
                  >
                    {stateList.length > 0
                      ? stateList
                        .sort((a, b) => (a.stateName > b.stateName ? 1 : -1))
                        .map((val, index) => {
                          return (
                            <MenuItem
                              key={`${index + 15}`}
                              value={val.stateName}
                            >
                              {val.stateName}
                            </MenuItem>
                          );
                        })
                      : null}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={2} sm={4} md={4} p={1}>
                <FormControl fullWidth size="small">
                  <InputLabel id="bulkBillerNameLabel">
                    Select Biller Name
                  </InputLabel>
                  <Select
                    label="Select Biller Name"
                    id="bulkBillerName"
                    name="billerName"
                    value={billerName}
                    onChange={handleChangeBillerName}
                  >
                    {billerNameListData?.length > 0
                      ? billerNameListData
                        ?.sort((a, b) =>
                          a.billerName > b.billerName ? 1 : -1
                        )
                        .map((val, index) => {
                          return (
                            <MenuItem
                              key={`${index + 15}`}
                              value={val.billerId + "/" + val.billerName}
                            >
                              {val.billerName}
                            </MenuItem>
                          );
                        })
                      : null}
                  </Select>
                </FormControl>
              </Grid>
              {/* {org Field} */}
              {orgField && orgField.length > 0
                ? orgField.map((field, index) => {
                  if (field?.filterFlag === 1) {
                    if (field?.fieldType === "char") {
                      return (
                        <Grid key={index} item xs={2} sm={4} md={4} p={1}>
                          <TextField
                            key={field?.fieldId}
                            fullWidth
                            size="small"
                            id="outlined-basic"
                            label={convertToTitleCase(field?.fieldName)}
                            name={field.fieldName}
                            value={filterBody[field?.fieldName]}
                            onChange={onChangeHandle}
                            variant="outlined"
                          />
                        </Grid>
                      );
                    }
                  }
                })
                : null}
            </Grid>
            <Stack direction={{ xs: "column", sm: "row" }} p={1} spacing={2}>
              <Button
                onClick={() => {
                  setFilterBody({ ...filterBody, pageNo: 0 });
                  consumerFilter();
                }}
                variant="contained"
              >
                Search Consumer
              </Button>
              <Button
                type="reset"
                color="inherit"
                onClick={clearState}
                variant="contained"
              >
                Clear
              </Button>
            </Stack>
          </Stack>
        </Card>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <EnhancedTableToolbar numSelected={selected.length} />
          <TableContainer>
            <Table sx={{ minWidth: 650 }} size="medium" aria-label="a dense table" >
              <TableHead>
                <TableRow>
                  {enableAction && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        color="primary"
                        indeterminate={selected?.length > 0 && selected?.length < consumerList?.length}
                        checked={consumerList?.length > 0 && selected?.length === consumerList?.length}
                        onChange={handleSelectAllClick}
                      />
                    </TableCell>
                  )}
                  <TableCell align="center">Consumer No.</TableCell>
                  <TableCell align="center">Consumer Name</TableCell>
                  {orgField && orgField?.length > 0 ? orgField?.map((field, index) => {
                    if (field?.filterFlag === 1) {
                      if (field?.fieldType === "char") {
                        return <TableCell key={index} align="center">   {convertToTitleCase(field?.fieldName)} </TableCell>
                      }
                    }
                  }) : null}
                  <TableCell align="center">Biller Name</TableCell>
                  <TableCell align="center">Biller Category</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Comment</TableCell>
                  <TableCell align="center">Consumer Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {consumerList && consumerList.map((item, index) => <ConsumerRow key={item.ConsumerId.toString() + index.toString()} item={item} index={index} />)}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[10, 25, 100]}
            component="div"
            count={dataLength}
            rowsPerPage={filterBody.rowPerPage}
            page={filterBody.pageNo}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </Stack>
    </>
  );
};

ConsumerListVerification.getLayout = (page) => (
  <DashboardLayoutUser>{page}</DashboardLayoutUser>
);

export default ConsumerListVerification;
