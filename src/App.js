import { Grid, Box } from '@mui/material';
import RobotComponent from './robot/RobotComponent.js';

function App() {
  return (
    <Box className="App" sx={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor:'#000000' }}>
      <Grid container>
        <Grid item xs={12}>
          <RobotComponent />
        </Grid>
      </Grid>
    </Box>
  );
}

export default App;
