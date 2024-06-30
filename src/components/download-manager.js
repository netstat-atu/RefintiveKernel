import React from 'react';

//** mui */
import { Modal, IconButton, Table, TableHead, Card, CardContent, TableContainer, TableRow, TableCell, TableBody, LinearProgress } from '@mui/material';

//** icon */
import CloseIcon from '@mui/icons-material/Close';
import { Download, Refresh } from '@mui/icons-material';

//** component */
import StyledTableRow from './StyledTableRow';

//** redux */
import { useDownloadManagerModal } from '../Provider/DownloadMangerModalContext';
import { useLoader } from '../Provider/LoaderContext';
import { useSelector } from 'react-redux';

//** service */
import { downloadExcelFromAPI, pdfBillDownload } from '../utils/bbps/billerServices';

//** utils */
import { creationDateTime } from '../utils/dateFormat';
import CustomModal from './CustomModal';

const DownloadManager = () => {
    const { isLoading, showLoader, hideLoader } = useLoader();
    const { isDownloadManager, closeDownloadManager } = useDownloadManagerModal();
    const { orgId, userId } = useSelector(state => state.user);
    const [isRefresh, setIsRefresh] = React.useState(false);
    const [downloadList, setDownloadList] = React.useState([]);
    const isRefreshToggle = () => setIsRefresh(!isRefresh)
    const getDownloadList = async () => {
        showLoader()
        try {
            let body = {
                "type": "DOWNLOAD_LIST",
                "userId": userId,
                "orgId": orgId
            }
            const resp = await downloadExcelFromAPI(body);
            if (resp?.statusCode == 200) {
                setDownloadList(resp.data)
            }
        } catch (error) {
            console.log("🚀 ~ file: download-manager.js:42 ~ getDownloadList ~ error:", error)
        } finally {
            hideLoader()
        }
    }
    const excelDownload = async (key) => {
        const body = {
            key: key
        }
        await pdfBillDownload(body).then((data) => {
            window.open(data)
        }).catch((error) => {
            console.log(error);
        })
    }

    React.useEffect(() => {
        { isDownloadManager ? getDownloadList() : null }
    }, [isDownloadManager, isRefresh])
    return (
        <CustomModal open={isDownloadManager} onClose={closeDownloadManager}>
            <Card>
                {isLoading ? <LinearProgress /> : null}
                <IconButton
                    edge="end"
                    color="inherit"
                    onClick={closeDownloadManager}
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 16,
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <IconButton
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 60,
                    }}
                    color="inherit"
                    onClick={isRefreshToggle}
                >
                    <Refresh />
                </IconButton>
                <CardContent>
                    <TableContainer>
                        <Table size="medium" aria-label="a dense table" sx={{ minWidth: 650 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">Task Name</TableCell>
                                    <TableCell align="center">Date Time</TableCell>
                                    <TableCell align="center">Request Id</TableCell>
                                    <TableCell align="center">Download Link</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {downloadList && downloadList?.map((e) => {
                                    return <StyledTableRow key={e.ID}  >
                                        <TableCell align="center">{e.excelName}</TableCell>
                                        <TableCell align="center">{creationDateTime(e.ts)}</TableCell>
                                        <TableCell align="center">{e.requestId}</TableCell>
                                        <TableCell align="center">
                                            {
                                                e.DownloadLink ? <IconButton
                                                    onClick={async () => await excelDownload(e.DownloadLink)} >
                                                    <Download color='info' />
                                                </IconButton> : <IconButton
                                                    onClick={isRefreshToggle} >
                                                    <Refresh color='info' />
                                                </IconButton>
                                            }
                                        </TableCell>
                                    </StyledTableRow>

                                })}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </Card>
        </CustomModal>
    );
};

export default DownloadManager;
