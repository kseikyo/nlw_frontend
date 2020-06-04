import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker } from 'react-leaflet';
import api from '../../services/api';

import { LeafletMouseEvent } from 'leaflet'

import axios from 'axios';

import './styles.css';
import logo from '../../assets/logo.svg';

import PointCreationSucceeded from '../PointCreationSucceeded';

interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface IBGEUFResponse {
  sigla: string;
}

interface IBGECITYResponse {
  nome: string;
}

const CreatePoint = () => {

  const [items, setItems] = useState<Item[]>([]);
  const [ufs, setUfs] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);

  const [hasSubmited, setHasSubmited] = useState<boolean>(false);

  const history = useHistory();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: ''
  });

  const [selectedUf, setselectedUf] = useState<string>('0');
  const [selectedCity, setselectedCity] = useState<string>('0');
  const [selectedItems, setselectedItems] = useState<number[]>([]);

  const [initialPosition, setinitialPosition] = useState<[number, number]>([0, 0]);
  const [selectedPosition, setselectedPosition] = useState<[number, number]>([0, 0]);

  useEffect(() => {
    api.get('items').then(res => {
      setItems(res.data);
    })
  }, []);

  useEffect(() => {
    axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados').then(res => {
      const ufInitials = res.data.map(uf => uf.sigla);

      setUfs(ufInitials);
    })
  },[]);

  useEffect(() => {
    if(selectedUf === '0') return;

    axios
    .get<IBGECITYResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
    .then(res => {
      const cityNames = res.data.map(city => city.nome);

      setCities(cityNames);
    })
  },[selectedUf]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(position => {
      const { latitude, longitude } = position.coords;

      setinitialPosition([latitude, longitude]);
      setselectedPosition([latitude, longitude]);
    })
  },[]);

  function handleSelectUf(event: ChangeEvent<HTMLSelectElement>) {
    setselectedUf(event.target.value);
    setselectedCity('0');
  }

  function handleSelectCity(event: ChangeEvent<HTMLSelectElement>) {
    setselectedCity(event.target.value);
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    setFormData({...formData, [name]: value })
  }

  function handleSelectItem(id: number) {
    const alreadySelected = selectedItems.findIndex(item => item === id);

    if(alreadySelected >= 0) {
      const filteredItems = selectedItems.filter(item => item !== id);
      setselectedItems(filteredItems);
    }
    else {
      setselectedItems([...selectedItems, id]);
    }
  }

  function handleMapClick(event: LeafletMouseEvent) {
    setselectedPosition([
      event.latlng.lat,
      event.latlng.lng
    ])
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const { name, email, whatsapp } = formData;
    const uf = selectedUf;
    const city = selectedCity;
    const [latitude, longitude] = selectedPosition;
    const items = selectedItems;

    const data = {
      image: "https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=400&q=60",
      name,
      email,
      whatsapp,
      uf,
      city,
      latitude,
      longitude,
      items
    };

    await api.post('/points', data);
    

    setHasSubmited(true);
    
    let delay = 2000;
    
    setTimeout(function() {
      history.push('/');
    }, delay);

  }


  return (
    <div id="page-create-point">
      { hasSubmited ? <PointCreationSucceeded /> : null }
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para a home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>Cadastro do <br /> ponto de coleta</h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              required
              onChange={handleInputChange}
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="Email">E-mail</label>
              <input
                required
                onChange={handleInputChange}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                required
                onChange={handleInputChange}
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={initialPosition} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy 
              <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={selectedPosition}>

            </Marker>
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                required
                value={selectedUf} 
                name="uf" 
                id="uf" 
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {
                  ufs.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))
                }
              </select>
            </div>
            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                required
                name="city" 
                id="city"
                value={selectedCity}
                onChange={handleSelectCity}
              >
                <option value="0">Selecione uma cidade</option>
                {
                  cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais itens abaixo</span>
          </legend>

          <ul className="items-grid">
            {
              items.map(item => (
                <li
                  key={item.id} 
                  onClick={() => {handleSelectItem(item.id)}}
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                  >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))
            }

          </ul>
        </fieldset>

        <button type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  );
}

export default CreatePoint;