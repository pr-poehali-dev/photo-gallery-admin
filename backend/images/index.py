'''
Business: List uploaded images from CDN for image gallery picker
Args: event with httpMethod, queryStringParameters; context with request_id
Returns: HTTP response with list of uploaded image URLs
'''

import json
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        try:
            predefined_images = [
                {
                    'url': 'https://cdn.poehali.dev/projects/86c96c3c-6cad-472d-8416-d5730424d827/files/f45eb1e5-e14b-4002-8c03-8564a5f5108e.jpg',
                    'name': 'business-portrait.jpg',
                    'size': 152000,
                    'uploaded_at': '2025-10-25T04:00:00Z'
                },
                {
                    'url': 'https://cdn.poehali.dev/projects/86c96c3c-6cad-472d-8416-d5730424d827/files/f3295b3f-a9ab-4d14-8f12-35003c4605be.jpg',
                    'name': 'creative-artist.jpg',
                    'size': 148000,
                    'uploaded_at': '2025-10-25T04:00:01Z'
                },
                {
                    'url': 'https://cdn.poehali.dev/projects/86c96c3c-6cad-472d-8416-d5730424d827/files/9dd6054f-df11-42dd-b672-fe63ec725401.jpg',
                    'name': 'fashion-model.jpg',
                    'size': 145000,
                    'uploaded_at': '2025-10-25T04:00:02Z'
                }
            ]
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'images': predefined_images}),
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
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }
