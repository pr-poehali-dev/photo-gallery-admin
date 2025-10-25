'''
Business: Gallery API for managing fame list items (CRUD operations)
Args: event with httpMethod, body, queryStringParameters; context with request_id
Returns: HTTP response with gallery items or operation status
'''

import json
import os
from typing import Dict, Any, List
import psycopg2
from psycopg2.extras import RealDictCursor

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
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            cursor.execute('SELECT * FROM gallery_items ORDER BY created_at DESC')
            items = cursor.fetchall()
            
            # Convert datetime to string for JSON serialization
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
            title = body_data.get('title', '')
            description = body_data.get('description', '')
            
            cursor.execute(
                "INSERT INTO gallery_items (image_url, title, description) VALUES (%s, %s, %s) RETURNING id",
                (image_url, title, description)
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
            query_params = event.get('queryStringParameters', {})
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
            
            cursor.execute('DELETE FROM gallery_items WHERE id = %s', (item_id,))
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
