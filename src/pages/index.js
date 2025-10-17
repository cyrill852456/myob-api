// pages/index.js
import { useState, useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    fetchItems();
    setCurrentTime(new Date().toLocaleString());
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await fetch('https://myob-woocommers-api.vercel.app/api/myob/items');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setItems(data.data);
        setError(null);
      } else {
        setError(data.error || 'Failed to fetch items');
      }
    } catch (err) {
      setError(err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>MYOB Items Dashboard</title>
        <meta name="description" content="View all items from MYOB Advanced Business" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
        {/* Header */}
        <header style={{
          backgroundColor: '#1e293b',
          color: 'white',
          padding: '2rem',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <h1 style={{ margin: '0 0 0.5rem 0', fontSize: '2rem', fontWeight: 'bold' }}>
              MYOB Items Dashboard
            </h1>
            <p style={{ margin: 0, opacity: 0.9, fontSize: '0.95rem' }}>
              DEJ Packaging - Real-time inventory sync
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' }}>
          {/* Controls */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap'
          }}>
            <input
              type="text"
              placeholder="Search items by name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                minWidth: '250px',
                padding: '0.75rem 1rem',
                border: '1px solid #e2e8f0',
                borderRadius: '0.5rem',
                fontSize: '1rem',
                fontFamily: 'inherit'
              }}
            />
            <button
              onClick={fetchItems}
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#cbd5e1' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                fontWeight: '500',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => !loading && (e.target.style.backgroundColor = '#2563eb')}
              onMouseOut={(e) => !loading && (e.target.style.backgroundColor = '#3b82f6')}
            >
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {/* Status Messages */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              padding: '1rem',
              borderRadius: '0.5rem',
              marginBottom: '2rem',
              border: '1px solid #fecaca'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {loading && !items.length && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: '#64748b',
              fontSize: '1.1rem'
            }}>
              Loading items...
            </div>
          )}

          {/* Items Count */}
          {!loading && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              <strong style={{ fontSize: '1.1rem' }}>
                {filteredItems.length} of {items.length} items
                {searchTerm && ` matching "${searchTerm}"`}
              </strong>
            </div>
          )}

          {/* Items Grid */}
          {filteredItems.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '1.5rem'
            }}>
              {filteredItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '1rem'
                  }}>
                    <div>
                      <h3 style={{
                        margin: '0 0 0.5rem 0',
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: '#1e293b'
                      }}>
                        {item.name}
                      </h3>
                      <p style={{
                        margin: 0,
                        fontSize: '0.875rem',
                        color: '#64748b'
                      }}>
                        Item #{item.number}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: '#dbeafe',
                      color: '#1e40af',
                      padding: '0.5rem 0.75rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      whiteSpace: 'nowrap'
                    }}>
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </div>
                  </div>

                  {item.description && (
                    <p style={{
                      margin: '0 0 1rem 0',
                      color: '#475569',
                      fontSize: '0.9rem',
                      lineHeight: '1.5'
                    }}>
                      {item.description}
                    </p>
                  )}

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    paddingTop: '1rem',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    {item.warehouse && (
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          Warehouse
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#1e293b'
                        }}>
                          {item.warehouse}
                        </p>
                      </div>
                    )}
                    {item.quantityOnHand !== undefined && (
                      <div>
                        <p style={{
                          margin: '0 0 0.25rem 0',
                          fontSize: '0.75rem',
                          color: '#94a3b8',
                          textTransform: 'uppercase',
                          fontWeight: '600'
                        }}>
                          Qty On Hand
                        </p>
                        <p style={{
                          margin: 0,
                          fontSize: '0.9rem',
                          color: '#1e293b',
                          fontWeight: '600'
                        }}>
                          {item.quantityOnHand}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !loading && (
              <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#64748b',
                fontSize: '1.1rem'
              }}>
                {searchTerm ? 'No items match your search' : 'No items found'}
              </div>
            )
          )}
        </main>

        {/* Footer */}
        <footer style={{
          backgroundColor: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          padding: '2rem',
          marginTop: '3rem',
          textAlign: 'center',
          color: '#64748b'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem' }}>
            Last updated: {currentTime || 'Loading...'}
          </p>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem' }}>
            API: myob-woocommers-api.vercel.app
          </p>
        </footer>
      </div>
    </>
  );
}