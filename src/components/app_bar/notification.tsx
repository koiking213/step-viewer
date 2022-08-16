import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import { useState } from "react"
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { Typography } from '@material-ui/core';



type ReleaseNoteItemProps = {
  content: ReleaseNoteContent;
}
const ReleaseNoteItem = ({ content }: ReleaseNoteItemProps) => {
  return (
    <div>
      <Typography variant="h6">
        {content.version} ({content.date})
      </Typography>
      <ListItem>
        <List>
          {content.texts.map((text, index) => (
            <ListItem key={index}>{text}</ListItem>
          ))}
        </List>
      </ListItem>
      <Divider />
    </div>
  );
}

const release_notes: ReleaseNoteContent[] = [
  {
    version: "1.0.0",
    date: "2022/08/16",
    texts: [
      "リリースノートを追加",
      "AppBarを追加",
    ]
  }
]

type ReleaseNoteContent = {
  version: string;
  date: string;
  texts: string[];
}

const Notification = () => {
  const [open, setOpen] = useState(false);
  const handleClickOpen = () => {
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div>
      <NotificationsNoneIcon onClick={handleClickOpen} />
      <Dialog onClose={handleClose} open={open}>
        <DialogTitle>Release Note</DialogTitle>
        <Divider />
        <List sx={{ pt: 0 }}>
          {release_notes.map((content, index) => (
            <ReleaseNoteItem key={index} content={content} />
          ))}
        </List>
      </Dialog>

    </div>
  );
}
export default Notification;