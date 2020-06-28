import React from 'react';
import { FiCheckCircle } from 'react-icons/fi';
import './styles.css';

const PointCreationSucceeded = () => {
  return (
    <div id="modal" style={{opacity: "86%!important"}}>
        <FiCheckCircle color="#34CB79" size={70}/>
        <strong>
          <h1>
            Cadastro concluído!
          </h1>
        </strong>
    </div>
  );
}

export default PointCreationSucceeded;