import React from 'react'
import { useState,useEffect } from 'react'
import axios from 'axios'
const Test = () => {

    useEffect(() => {
        console.log("hii");
    
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5800/');
                console.log('Response:', response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
    
        fetchData();
    }, []);
    // const handleClick = async () => {
  return (
    <div>Test</div>
  )
}

export default Test