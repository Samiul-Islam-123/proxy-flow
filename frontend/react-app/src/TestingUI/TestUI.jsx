import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Card,
  CardContent,
  Grid,
  Box,
  Collapse,
  Slider,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import io from "socket.io-client"

export default function TestUI() {
  const [apiUrl, setApiUrl] = useState('');
  const [selectedTests, setSelectedTests] = useState({
    loadTest: false,
    stressTest: false,
    scalabilityTest: false,
    spikeTest: false,
    unitTest: false,
    integrationTest: false,
    systemTest: false,
    manualTest: false,
  });
  const [testOptions, setTestOptions] = useState({});
  
  
  useEffect(() => {
    const socket = io('http://localhost:3000');
    socket.emit('load-test')
  },[])

  const handleTestSelection = (test) => {
    setSelectedTests((prev) => ({ ...prev, [test]: !prev[test] }));
    if (!selectedTests[test]) {
      setTestOptions((prev) => ({
        ...prev,
        [test]: getDefaultOptions(test),
      }));
    }
  };

  const handleOptionChange = (test, option, value) => {
    setTestOptions((prev) => ({
      ...prev,
      [test]: {
        ...prev[test],
        [option]: value,
      },
    }));
  };

  const getDefaultOptions = (test) => {
    switch (test) {
      case 'loadTest':
        return { users: 100, duration: 60 };
      case 'stressTest':
        return { maxUsers: 1000, rampUpTime: 30 };
      case 'scalabilityTest':
        return { startUsers: 10, endUsers: 1000, steps: 5 };
      case 'spikeTest':
        return { baseUsers: 100, spikeUsers: 1000, spikeDuration: 60 };
      case 'unitTest':
        return { testSuite: 'default' };
      case 'integrationTest':
        return { components: ['all'] };
      case 'systemTest':
        return { environment: 'staging' };
      case 'manualTest':
        return { testCases: 5 };
      default:
        return {};
    }
  };

  const renderTestOptions = (test) => {
    if (!selectedTests[test]) return null;

    switch (test) {
      case 'loadTest':
        return (
          <>
            <Typography gutterBottom>Number of Users</Typography>
            <Slider
              value={testOptions[test]?.users || 100}
              onChange={(_, value) => handleOptionChange(test, 'users', value)}
              min={1}
              max={1000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Duration (seconds)</Typography>
            <Slider
              value={testOptions[test]?.duration || 60}
              onChange={(_, value) => handleOptionChange(test, 'duration', value)}
              min={10}
              max={300}
              valueLabelDisplay="auto"
            />
          </>
        );
      case 'stressTest':
        return (
          <>
            <Typography gutterBottom>Max Users</Typography>
            <Slider
              value={testOptions[test]?.maxUsers || 1000}
              onChange={(_, value) => handleOptionChange(test, 'maxUsers', value)}
              min={100}
              max={10000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Ramp-up Time (seconds)</Typography>
            <Slider
              value={testOptions[test]?.rampUpTime || 30}
              onChange={(_, value) => handleOptionChange(test, 'rampUpTime', value)}
              min={10}
              max={300}
              valueLabelDisplay="auto"
            />
          </>
        );
      case 'scalabilityTest':
        return (
          <>
            <Typography gutterBottom>Start Users</Typography>
            <Slider
              value={testOptions[test]?.startUsers || 10}
              onChange={(_, value) => handleOptionChange(test, 'startUsers', value)}
              min={1}
              max={1000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>End Users</Typography>
            <Slider
              value={testOptions[test]?.endUsers || 1000}
              onChange={(_, value) => handleOptionChange(test, 'endUsers', value)}
              min={10}
              max={10000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Steps</Typography>
            <Slider
              value={testOptions[test]?.steps || 5}
              onChange={(_, value) => handleOptionChange(test, 'steps', value)}
              min={2}
              max={20}
              valueLabelDisplay="auto"
            />
          </>
        );
      case 'spikeTest':
        return (
          <>
            <Typography gutterBottom>Base Users</Typography>
            <Slider
              value={testOptions[test]?.baseUsers || 100}
              onChange={(_, value) => handleOptionChange(test, 'baseUsers', value)}
              min={10}
              max={1000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Spike Users</Typography>
            <Slider
              value={testOptions[test]?.spikeUsers || 1000}
              onChange={(_, value) => handleOptionChange(test, 'spikeUsers', value)}
              min={100}
              max={10000}
              valueLabelDisplay="auto"
            />
            <Typography gutterBottom>Spike Duration (seconds)</Typography>
            <Slider
              value={testOptions[test]?.spikeDuration || 60}
              onChange={(_, value) => handleOptionChange(test, 'spikeDuration', value)}
              min={10}
              max={300}
              valueLabelDisplay="auto"
            />
          </>
        );
      case 'unitTest':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Test Suite</InputLabel>
            <Select
              value={testOptions[test]?.testSuite || 'default'}
              onChange={(e) => handleOptionChange(test, 'testSuite', e.target.value)}
            >
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="comprehensive">Comprehensive</MenuItem>
              <MenuItem value="quick">Quick</MenuItem>
            </Select>
          </FormControl>
        );
      case 'integrationTest':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Components</InputLabel>
            <Select
              multiple
              value={testOptions[test]?.components || ['all']}
              onChange={(e) => handleOptionChange(test, 'components', e.target.value)}
              renderValue={(selected) => (selected).join(', ')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="database">Database</MenuItem>
              <MenuItem value="api">API</MenuItem>
              <MenuItem value="ui">UI</MenuItem>
            </Select>
          </FormControl>
        );
      case 'systemTest':
        return (
          <FormControl fullWidth margin="normal">
            <InputLabel>Environment</InputLabel>
            <Select
              value={testOptions[test]?.environment || 'staging'}
              onChange={(e) => handleOptionChange(test, 'environment', e.target.value)}
            >
              <MenuItem value="development">Development</MenuItem>
              <MenuItem value="staging">Staging</MenuItem>
              <MenuItem value="production">Production</MenuItem>
            </Select>
          </FormControl>
        );
      case 'manualTest':
        return (
          <TextField
            fullWidth
            label="Number of Test Cases"
            type="number"
            value={testOptions[test]?.testCases || 5}
            onChange={(e) => handleOptionChange(test, 'testCases', parseInt(e.target.value))}
            margin="normal"
          />
        );
      default:
        return null;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('API URL:', apiUrl);
    console.log('Selected Tests:', selectedTests);
    console.log('Test Options:', testOptions);
  };

  return (
    <Box sx={{ maxWidth: 600, margin: 'auto', padding: 2 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>
            API Testing Interface
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="API URL"
              variant="outlined"
              type="url"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://api.example.com"
              required
              margin="normal"
            />

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Performance Tests
            </Typography>
            <Grid container spacing={2}>
              {['loadTest', 'stressTest', 'scalabilityTest', 'spikeTest'].map((test) => (
                <Grid item xs={6} key={test}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTests[test]}
                        onChange={() => handleTestSelection(test)}
                      />
                    }
                    label={test.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  />
                  <Collapse in={selectedTests[test]} timeout="auto" unmountOnExit>
                    {renderTestOptions(test)}
                  </Collapse>
                </Grid>
              ))}
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Functional Tests
            </Typography>
            <Grid container spacing={2}>
              {['unitTest', 'integrationTest', 'systemTest', 'manualTest'].map((test) => (
                <Grid item xs={6} key={test}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedTests[test]}
                        onChange={() => handleTestSelection(test)}
                      />
                    }
                    label={test.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
                  />
                  <Collapse in={selectedTests[test]} timeout="auto" unmountOnExit>
                    {renderTestOptions(test)}
                  </Collapse>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Button variant="contained" type="submit">
                Submit
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
}
