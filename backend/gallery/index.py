'''
Business: TG Fame Gallery API for managing persons with categories (CRUD operations)
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with persons, categories or operation status
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

SCHEMA = 't_p61347388_photo_gallery_admin'

def get_db_connection():
    """Get PostgreSQL database connection"""
    database_url = os.environ.get('DATABASE_URL')
    return psycopg2.connect(database_url)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        query_params = event.get('queryStringParameters', {}) or {}
        request_type = query_params.get('type', 'persons')
        
        if method == 'GET':
            if request_type == 'view':
                person_id = query_params.get('id')
                if not person_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Missing id parameter'}),
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    f'UPDATE {SCHEMA}.gallery_items SET views = views + 1 WHERE id = %s RETURNING views',
                    (person_id,)
                )
                result = cursor.fetchone()
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'views': result['views'] if result else 0}),
                    'isBase64Encoded': False
                }
            if request_type == 'categories':
                cursor.execute(f'SELECT * FROM {SCHEMA}.categories ORDER BY id')
                categories = cursor.fetchall()
                
                for cat in categories:
                    if cat.get('created_at'):
                        cat['created_at'] = cat['created_at'].isoformat()
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'categories': categories}),
                    'isBase64Encoded': False
                }
            else:
                cursor.execute(f'''
                    SELECT 
                        gi.*,
                        c.name as category_name,
                        c.color as category_color
                    FROM {SCHEMA}.gallery_items gi
                    LEFT JOIN {SCHEMA}.categories c ON gi.category_id = c.id
                    ORDER BY gi.created_at DESC
                ''')
                items = cursor.fetchall()
                
                for item in items:
                    if item.get('created_at'):
                        item['created_at'] = item['created_at'].isoformat()
                    if item.get('updated_at'):
                        item['updated_at'] = item['updated_at'].isoformat()
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'items': items}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            image_url = body_data.get('image_url', '')
            name = body_data.get('name', '')
            bio = body_data.get('bio', '')
            category_id = body_data.get('category_id', 1)
            telegram_username = body_data.get('telegram_username', '')
            
            cursor.execute(
                f'''INSERT INTO {SCHEMA}.gallery_items 
                (image_url, name, bio, category_id, telegram_username) 
                VALUES (%s, %s, %s, %s, %s) RETURNING id''',
                (image_url, name, bio, category_id, telegram_username if telegram_username else None)
            )
            new_id = cursor.fetchone()['id']
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 201,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'id': new_id
                }),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            item_id = query_params.get('id')
            
            if not item_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Missing id parameter'}),
                    'isBase64Encoded': False
                }
            
            cursor.execute(f'DELETE FROM {SCHEMA}.gallery_items WHERE id = %s', (item_id,))
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True}),
                'isBase64Encoded': False
            }
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }