import { Modal, Box, Typography } from '@mui/material';
import { SxProps } from '@mui/system';

interface AlertModalProps {
    open: boolean;
    handleClose: () => void;
    style: SxProps;
    title: string;
    content: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ open, handleClose, style, title, content }) => {
    return (
        <Modal
            style={{zIndex: "9999"}}
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    {title}
                </Typography>
                <Typography id="modal-modal-description" sx={{ mt: 2 }}>
                    {content}
                </Typography>
            </Box>
        </Modal>
    );
};